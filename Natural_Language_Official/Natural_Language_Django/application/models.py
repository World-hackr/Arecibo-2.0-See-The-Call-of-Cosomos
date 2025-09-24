from django.db import models
from django.contrib.auth.models import User
import os
import json


class AudioProject(models.Model):
    WAVE_TYPE_CHOICES = [
        ('sine', 'Sine Wave'),
        ('square', 'Square Wave'),
        ('triangle', 'Triangle Wave'),
        ('sawtooth', 'Sawtooth Wave'),
        ('uploaded', 'Uploaded File'),
    ]
    
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    wave_type = models.CharField(max_length=20, choices=WAVE_TYPE_CHOICES, default='uploaded')
    
    # Original audio file
    original_file = models.FileField(upload_to='audio/original/', null=True, blank=True)
    
    # Generated/Modified audio
    modified_file = models.FileField(upload_to='audio/modified/', null=True, blank=True)
    
    # Custom wave parameters (stored as JSON)
    wave_parameters = models.JSONField(default=dict, blank=True)
    
    # Envelope data (stored as JSON)
    envelope_data = models.JSONField(default=dict, blank=True)
    
    # Color settings
    background_color = models.CharField(max_length=7, default='#000000')
    positive_color = models.CharField(max_length=7, default='#00FF00')
    negative_color = models.CharField(max_length=7, default='#00FFFF')
    
    # Generated visualizations
    final_drawing = models.ImageField(upload_to='visualizations/final/', null=True, blank=True)
    final_drawing_svg = models.FileField(upload_to='visualizations/final_svg/', null=True, blank=True)
    natural_lang = models.ImageField(upload_to='visualizations/natural/', null=True, blank=True)
    natural_lang_svg = models.FileField(upload_to='visualizations/natural_svg/', null=True, blank=True)
    wave_comparison = models.ImageField(upload_to='visualizations/comparison/', null=True, blank=True)
    wave_comparison_svg = models.FileField(upload_to='visualizations/comparison_svg/', null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_processing = models.BooleanField(default=False)
    processing_error = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.get_wave_type_display()}"
    
    @property
    def folder_name(self):
        """Generate folder name similar to original script"""
        return f"{self.name}_{self.id}"
    
    def get_absolute_url(self):
        return f"/project/{self.id}/"
