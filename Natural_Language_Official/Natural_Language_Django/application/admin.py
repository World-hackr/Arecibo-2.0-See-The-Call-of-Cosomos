from django.contrib import admin
from .models import AudioProject


@admin.register(AudioProject)
class AudioProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'wave_type', 'is_processing', 'created_at', 'updated_at']
    list_filter = ['wave_type', 'is_processing', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at', 'processing_error']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'wave_type')
        }),
        ('Audio Files', {
            'fields': ('original_file', 'modified_file')
        }),
        ('Wave Parameters', {
            'fields': ('wave_parameters',),
            'classes': ('collapse',)
        }),
        ('Colors', {
            'fields': ('background_color', 'positive_color', 'negative_color')
        }),
        ('Visualizations', {
            'fields': (
                'final_drawing', 'final_drawing_svg',
                'natural_lang', 'natural_lang_svg',
                'wave_comparison', 'wave_comparison_svg'
            ),
            'classes': ('collapse',)
        }),
        ('Processing Status', {
            'fields': ('is_processing', 'processing_error', 'created_at', 'updated_at')
        }),
        ('Envelope Data', {
            'fields': ('envelope_data',),
            'classes': ('collapse',)
        })
    )
