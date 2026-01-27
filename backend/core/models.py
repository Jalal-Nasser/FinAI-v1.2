from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
import uuid

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('role', 'admin')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('auditor', 'Auditor'),
        ('accountant', 'Accountant'),
        ('finance_manager', 'Finance Manager'),
        ('admin', 'Admin'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255, null=True, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    organization = models.ForeignKey('Organization', on_delete=models.SET_NULL, null=True, blank=True, related_name='users')
    login_method = models.CharField(max_length=64, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    last_signed_in = models.DateTimeField(auto_now=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']
    
    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['organization']),
        ]
    
    def __str__(self):
        return self.email

class Organization(models.Model):
    COUNTRY_CHOICES = [
        ('SA', 'Saudi Arabia'),
        ('AE', 'United Arab Emirates'),
        ('BH', 'Bahrain'),
        ('KW', 'Kuwait'),
        ('OM', 'Oman'),
        ('QA', 'Qatar'),
    ]
    
    COMPANY_TYPE_CHOICES = [
        ('government', 'Government'),
        ('semi_government', 'Semi-Government'),
        ('private', 'Private'),
        ('sme', 'SME'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    country = models.CharField(max_length=2, choices=COUNTRY_CHOICES)
    tax_id = models.CharField(max_length=100, null=True, blank=True)
    vat_rate = models.IntegerField(default=15)  # VAT rate in percentage
    currency = models.CharField(max_length=10, default='SAR')
    industry = models.CharField(max_length=100, null=True, blank=True)
    company_type = models.CharField(max_length=20, choices=COMPANY_TYPE_CHOICES, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'organizations'
    
    def __str__(self):
        return self.name

class AuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='audit_logs')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='audit_logs')
    action = models.CharField(max_length=100)
    entity_type = models.CharField(max_length=50)
    entity_id = models.UUIDField(null=True, blank=True)
    old_value_json = models.JSONField(null=True, blank=True)
    new_value_json = models.JSONField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'audit_logs'
        indexes = [
            models.Index(fields=['organization']),
            models.Index(fields=['user']),
            models.Index(fields=['action']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.action}"

class Configuration(models.Model):
    CONFIG_TYPE_CHOICES = [
        ('system', 'System'),
        ('organization', 'Organization'),
        ('user', 'User'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, null=True, blank=True, related_name='configurations')
    config_key = models.CharField(max_length=100)
    config_value = models.TextField()
    config_type = models.CharField(max_length=20, choices=CONFIG_TYPE_CHOICES, default='system')
    description = models.TextField(null=True, blank=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'configurations'
        indexes = [
            models.Index(fields=['organization']),
            models.Index(fields=['config_key']),
        ]
        unique_together = [['organization', 'config_key']]
    
    def __str__(self):
        return f"{self.config_key}: {self.config_value}"
