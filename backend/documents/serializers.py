from rest_framework import serializers
from .models import Document, ExtractedData, Transaction
from core.serializers import UserSerializer

class DocumentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.name', read_only=True)
    
    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ['id', 'uploaded_at', 'processed_at', 'storage_key', 'storage_url']

class ExtractedDataSerializer(serializers.ModelSerializer):
    document_name = serializers.CharField(source='document.file_name', read_only=True)
    validated_by_name = serializers.CharField(source='validated_by.name', read_only=True)
    
    class Meta:
        model = ExtractedData
        fields = '__all__'
        read_only_fields = ['id', 'extracted_at', 'validated_at']

class TransactionSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)
    document_name = serializers.CharField(source='document.file_name', read_only=True)
    
    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'reconciled_at']
