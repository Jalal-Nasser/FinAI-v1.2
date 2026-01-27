from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.storage import default_storage
from django.utils import timezone
from .models import Document, ExtractedData, Transaction
from .serializers import DocumentSerializer, ExtractedDataSerializer, TransactionSerializer
from core.ai_service import ai_service
from decimal import Decimal
import uuid
import base64
import os

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Document.objects.all()
        elif user.organization:
            return Document.objects.filter(organization=user.organization)
        return Document.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)
    
    @action(detail=False, methods=['post'])
    def upload(self, request):
        """Upload document with file handling"""
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        organization_id = request.data.get('organization_id')
        document_type = request.data.get('document_type', 'other')
        
        # Save file
        file_name = file.name
        doc_id = str(uuid.uuid4())
        storage_key = f"documents/{organization_id}/{doc_id}/{file_name}"
        storage_path = default_storage.save(storage_key, file)
        storage_url = default_storage.url(storage_path)
        
        # Create document record
        document = Document.objects.create(
            id=doc_id,
            organization_id=organization_id,
            uploaded_by=request.user,
            file_name=file_name,
            file_type=file.content_type,
            file_size=file.size,
            storage_key=storage_key,
            storage_url=storage_url,
            document_type=document_type,
            status='pending'
        )
        
        serializer = self.get_serializer(document)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def process(self, request, pk=None):
        """Process document with AI"""
        document = self.get_object()
        
        # Update status to processing
        document.status = 'processing'
        document.save()
        
        try:
            # Get full URL for the image
            image_url = request.build_absolute_uri(document.storage_url)
            
            # Process with AI
            result = ai_service.process_document_with_vision(
                image_url=image_url,
                document_type=document.document_type
            )
            
            if not result.get('success'):
                document.status = 'failed'
                document.save()
                return Response({
                    'success': False,
                    'error': result.get('error', 'Processing failed')
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Save extracted data
            structured_data = result.get('structured_data', {})
            extracted_text = result.get('extracted_text', {})
            
            extracted_data = ExtractedData.objects.create(
                document=document,
                organization=document.organization,
                vendor_name=structured_data.get('vendorName'),
                customer_name=structured_data.get('customerName'),
                invoice_number=structured_data.get('invoiceNumber'),
                invoice_date=structured_data.get('invoiceDate'),
                due_date=structured_data.get('dueDate'),
                total_amount=Decimal(str(structured_data.get('totalAmount', 0))) if structured_data.get('totalAmount') else None,
                tax_amount=Decimal(str(structured_data.get('taxAmount', 0))) if structured_data.get('taxAmount') else None,
                currency=structured_data.get('currency'),
                items_json=structured_data.get('items'),
                raw_text_ar=extracted_text.get('arabic'),
                raw_text_en=extracted_text.get('english'),
                confidence=result.get('confidence', 0)
            )
            
            # Update document
            document.status = 'completed'
            document.language = result.get('language', 'en')
            document.is_handwritten = result.get('is_handwritten', False)
            document.processed_at = timezone.now()
            document.save()
            
            return Response({
                'success': True,
                'extracted_data_id': str(extracted_data.id),
                'confidence': result.get('confidence'),
                'language': result.get('language'),
                'is_handwritten': result.get('is_handwritten')
            })
            
        except Exception as e:
            document.status = 'failed'
            document.save()
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ExtractedDataViewSet(viewsets.ModelViewSet):
    queryset = ExtractedData.objects.all()
    serializer_class = ExtractedDataSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return ExtractedData.objects.all()
        elif user.organization:
            return ExtractedData.objects.filter(organization=user.organization)
        return ExtractedData.objects.none()
    
    @action(detail=True, methods=['post'])
    def validate_data(self, request, pk=None):
        """Validate extracted data"""
        extracted = self.get_object()
        validation_status = request.data.get('status', 'validated')
        
        extracted.validation_status = validation_status
        extracted.validated_by = request.user
        extracted.validated_at = timezone.now()
        extracted.save()
        
        serializer = self.get_serializer(extracted)
        return Response(serializer.data)

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Transaction.objects.all() if user.role == 'admin' else Transaction.objects.filter(organization=user.organization)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date and end_date:
            queryset = queryset.filter(transaction_date__range=[start_date, end_date])
        
        # Filter by type
        transaction_type = self.request.query_params.get('type')
        if transaction_type:
            queryset = queryset.filter(transaction_type=transaction_type)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def reconcile(self, request, pk=None):
        """Mark transaction as reconciled"""
        transaction = self.get_object()
        transaction.is_reconciled = True
        transaction.reconciled_at = timezone.now()
        transaction.save()
        
        serializer = self.get_serializer(transaction)
        return Response(serializer.data)
