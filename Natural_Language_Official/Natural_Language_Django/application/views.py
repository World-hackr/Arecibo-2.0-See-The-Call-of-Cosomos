from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.paginator import Paginator
from django.contrib import messages
from django.urls import reverse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import json
import threading
from .models import AudioProject
from .audio_processor import AudioProcessor
from .serializers import AudioProjectSerializer


def gallery_view(request):
    """Gallery page showing all audio projects"""
    projects = AudioProject.objects.all().order_by('-created_at')
    paginator = Paginator(projects, 12)  # Show 12 projects per page
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_obj': page_obj,
        'total_projects': projects.count()
    }
    return render(request, 'application/gallery.html', context)


def project_detail_view(request, project_id):
    """Detail view for individual project"""
    project = get_object_or_404(AudioProject, id=project_id)
    
    # Get audio processor for color palette
    processor = AudioProcessor()
    
    context = {
        'project': project,
        'color_palette': processor.techy_colors
    }
    return render(request, 'application/project_detail.html', context)


def create_project_view(request):
    """Create new audio project"""
    processor = AudioProcessor()
    
    if request.method == 'POST':
        try:
            # Extract form data
            name = request.POST.get('name')
            description = request.POST.get('description', '')
            wave_type = request.POST.get('wave_type', 'sine')
            
            # Color settings
            bg_color = request.POST.get('background_color', '#000000')
            pos_color = request.POST.get('positive_color', '#00FF00')
            neg_color = request.POST.get('negative_color', '#00FFFF')
            
            # Create project
            project = AudioProject.objects.create(
                name=name,
                description=description,
                wave_type=wave_type,
                background_color=bg_color,
                positive_color=pos_color,
                negative_color=neg_color,
                is_processing=True
            )
            
            # Handle file upload
            if 'audio_file' in request.FILES and request.FILES['audio_file']:
                project.original_file = request.FILES['audio_file']
                project.wave_type = 'uploaded'
            
            # Handle custom wave parameters
            if wave_type != 'uploaded':
                wave_params = {
                    'freq': float(request.POST.get('frequency', 440)),
                    'spw': int(request.POST.get('samples_per_wave', 100)),
                    'periods': int(request.POST.get('periods', 10))
                }
                project.wave_parameters = wave_params
            
            project.save()
            
            # Process in background
            def process_project():
                processor = AudioProcessor()
                processor.process_audio_project(project)
            
            thread = threading.Thread(target=process_project)
            thread.start()
            
            messages.success(request, f'Project "{name}" created successfully and is being processed.')
            return redirect('project_detail', project_id=project.id)
            
        except Exception as e:
            messages.error(request, f'Error creating project: {str(e)}')
    
    context = {
        'color_palette': processor.techy_colors
    }
    return render(request, 'application/create_project.html', context)


def visualize_project_view(request, project_id):
    """Enhanced visualization view with interactive features"""
    project = get_object_or_404(AudioProject, id=project_id)
    
    context = {
        'project': project
    }
    return render(request, 'application/visualize.html', context)


@csrf_exempt
@require_http_methods(["POST"])
def update_envelope_view(request, project_id):
    """Update envelope data for a project"""
    project = get_object_or_404(AudioProject, id=project_id)
    
    try:
        data = json.loads(request.body)
        envelope_data = data.get('envelope_data', {})
        
        # Update envelope and reprocess
        project.is_processing = True
        project.save()
        
        def reprocess_project():
            processor = AudioProcessor()
            processor.process_audio_project(project, envelope_data)
        
        thread = threading.Thread(target=reprocess_project)
        thread.start()
        
        return JsonResponse({
            'status': 'success',
            'message': 'Envelope updated successfully. Project is being reprocessed.'
        })
        
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=400)


def delete_project_view(request, project_id):
    """Delete a project"""
    project = get_object_or_404(AudioProject, id=project_id)
    
    if request.method == 'POST':
        project.delete()
        messages.success(request, 'Project deleted successfully.')
        return redirect('gallery')
    
    return render(request, 'application/confirm_delete.html', {'project': project})


# API Views for REST API functionality
@api_view(['GET'])
def api_projects_list(request):
    """API endpoint to list all projects with pagination"""
    projects = AudioProject.objects.all().order_by('-created_at')
    
    # Add pagination
    page = request.GET.get('page', 1)
    paginator = Paginator(projects, 12)  # 12 projects per page
    page_obj = paginator.get_page(page)
    
    serializer = AudioProjectSerializer(page_obj, many=True)
    
    return Response({
        'results': serializer.data,
        'total_projects': paginator.count,
        'total_pages': paginator.num_pages,
        'current_page': page_obj.number,
        'has_next': page_obj.has_next(),
        'has_previous': page_obj.has_previous(),
    })


@api_view(['GET'])
def api_project_detail(request, project_id):
    """API endpoint for project detail"""
    try:
        project = AudioProject.objects.get(id=project_id)
        serializer = AudioProjectSerializer(project)
        return Response(serializer.data)
    except AudioProject.DoesNotExist:
        return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def api_create_project(request):
    """API endpoint to create new project"""
    try:
        serializer = AudioProjectSerializer(data=request.data)
        if serializer.is_valid():
            project = serializer.save(is_processing=True)
            
            # Process in background
            def process_project():
                processor = AudioProcessor()
                processor.process_audio_project(project)
            
            thread = threading.Thread(target=process_project)
            thread.start()
            
            return Response(AudioProjectSerializer(project).data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT', 'PATCH'])
def api_update_envelope(request, project_id):
    """API endpoint to update envelope data"""
    try:
        project = AudioProject.objects.get(id=project_id)
        envelope_data = request.data.get('envelope_data', {})
        
        project.is_processing = True
        project.save()
        
        def reprocess_project():
            processor = AudioProcessor()
            processor.process_audio_project(project, envelope_data)
        
        thread = threading.Thread(target=reprocess_project)
        thread.start()
        
        return Response({
            'status': 'success',
            'message': 'Envelope updated successfully'
        })
        
    except AudioProject.DoesNotExist:
        return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
def api_delete_project(request, project_id):
    """API endpoint to delete project"""
    try:
        project = AudioProject.objects.get(id=project_id)
        project.delete()
        return Response({'message': 'Project deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    except AudioProject.DoesNotExist:
        return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def api_project_status(request, project_id):
    """API endpoint to check project processing status"""
    try:
        project = AudioProject.objects.get(id=project_id)
        return Response({
            'id': project.id,
            'is_processing': project.is_processing,
            'processing_error': project.processing_error,
            'updated_at': project.updated_at
        })
    except AudioProject.DoesNotExist:
        return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def api_project_audio_data(request, project_id):
    """API endpoint to get audio data for visualization"""
    try:
        project = AudioProject.objects.get(id=project_id)
        
        # Load audio data
        processor = AudioProcessor()
        if project.wave_type == 'uploaded' and project.original_file:
            audio_data, sample_rate = processor.load_audio_file(project.original_file.path)
        else:
            # Generate custom wave
            params = project.wave_parameters
            audio_data, sample_rate = processor.generate_custom_wave(
                wave_type=project.wave_type,
                freq=params.get('freq', 440),
                spw=params.get('spw', 100),
                periods=params.get('periods', 10)
            )
        
        # Get envelope data
        envelope_pos = project.envelope_data.get('positive', [0] * len(audio_data))
        envelope_neg = project.envelope_data.get('negative', [0] * len(audio_data))
        
        # Ensure envelope arrays match audio length
        if len(envelope_pos) != len(audio_data):
            envelope_pos = [0] * len(audio_data)
        if len(envelope_neg) != len(audio_data):
            envelope_neg = [0] * len(audio_data)
        
        return Response({
            'audio_data': audio_data.tolist(),
            'sample_rate': sample_rate,
            'envelope_pos': envelope_pos,
            'envelope_neg': envelope_neg,
            'length': len(audio_data)
        })
        
    except AudioProject.DoesNotExist:
        return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
