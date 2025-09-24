from rest_framework import serializers
from .models import AudioProject


class AudioProjectSerializer(serializers.ModelSerializer):
    """Serializer for AudioProject model"""
    
    # Read-only fields for file URLs
    original_file_url = serializers.SerializerMethodField()
    modified_file_url = serializers.SerializerMethodField()
    final_drawing_url = serializers.SerializerMethodField()
    final_drawing_svg_url = serializers.SerializerMethodField()
    natural_lang_url = serializers.SerializerMethodField()
    natural_lang_svg_url = serializers.SerializerMethodField()
    wave_comparison_url = serializers.SerializerMethodField()
    wave_comparison_svg_url = serializers.SerializerMethodField()
    
    class Meta:
        model = AudioProject
        fields = [
            'id', 'name', 'description', 'wave_type', 'wave_parameters',
            'envelope_data', 'background_color', 'positive_color', 'negative_color',
            'created_at', 'updated_at', 'is_processing', 'processing_error',
            'original_file', 'modified_file', 'final_drawing', 'final_drawing_svg',
            'natural_lang', 'natural_lang_svg', 'wave_comparison', 'wave_comparison_svg',
            'original_file_url', 'modified_file_url', 'final_drawing_url', 
            'final_drawing_svg_url', 'natural_lang_url', 'natural_lang_svg_url',
            'wave_comparison_url', 'wave_comparison_svg_url'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'is_processing', 'processing_error',
            'modified_file', 'final_drawing', 'final_drawing_svg',
            'natural_lang', 'natural_lang_svg', 'wave_comparison', 'wave_comparison_svg'
        ]
    
    def get_original_file_url(self, obj):
        if obj.original_file:
            return self.context['request'].build_absolute_uri(obj.original_file.url) if 'request' in self.context else obj.original_file.url
        return None
    
    def get_modified_file_url(self, obj):
        if obj.modified_file:
            return self.context['request'].build_absolute_uri(obj.modified_file.url) if 'request' in self.context else obj.modified_file.url
        return None
    
    def get_final_drawing_url(self, obj):
        if obj.final_drawing:
            return self.context['request'].build_absolute_uri(obj.final_drawing.url) if 'request' in self.context else obj.final_drawing.url
        return None
    
    def get_final_drawing_svg_url(self, obj):
        if obj.final_drawing_svg:
            return self.context['request'].build_absolute_uri(obj.final_drawing_svg.url) if 'request' in self.context else obj.final_drawing_svg.url
        return None
    
    def get_natural_lang_url(self, obj):
        if obj.natural_lang:
            return self.context['request'].build_absolute_uri(obj.natural_lang.url) if 'request' in self.context else obj.natural_lang.url
        return None
    
    def get_natural_lang_svg_url(self, obj):
        if obj.natural_lang_svg:
            return self.context['request'].build_absolute_uri(obj.natural_lang_svg.url) if 'request' in self.context else obj.natural_lang_svg.url
        return None
    
    def get_wave_comparison_url(self, obj):
        if obj.wave_comparison:
            return self.context['request'].build_absolute_uri(obj.wave_comparison.url) if 'request' in self.context else obj.wave_comparison.url
        return None
    
    def get_wave_comparison_svg_url(self, obj):
        if obj.wave_comparison_svg:
            return self.context['request'].build_absolute_uri(obj.wave_comparison_svg.url) if 'request' in self.context else obj.wave_comparison_svg.url
        return None


class EnvelopeUpdateSerializer(serializers.Serializer):
    """Serializer for envelope data updates"""
    envelope_data = serializers.JSONField()
    
    def validate_envelope_data(self, value):
        """Validate envelope data structure"""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Envelope data must be a dictionary")
        
        if 'positive' in value and not isinstance(value['positive'], list):
            raise serializers.ValidationError("Positive envelope data must be a list")
        
        if 'negative' in value and not isinstance(value['negative'], list):
            raise serializers.ValidationError("Negative envelope data must be a list")
        
        return value