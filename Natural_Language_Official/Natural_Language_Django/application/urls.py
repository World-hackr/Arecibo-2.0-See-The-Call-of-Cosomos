from django.urls import path
from . import views

urlpatterns = [
    # Web Interface URLs
    path('', views.gallery_view, name='gallery'),
    path('project/<int:project_id>/', views.project_detail_view, name='project_detail'),
    path('create/', views.create_project_view, name='create_project'),
    path('project/<int:project_id>/visualize/', views.visualize_project_view, name='visualize_project'),
    path('project/<int:project_id>/update-envelope/', views.update_envelope_view, name='update_envelope'),
    path('project/<int:project_id>/delete/', views.delete_project_view, name='delete_project'),
    
    # API URLs
    path('api/projects/', views.api_projects_list, name='api_projects_list'),
    path('api/projects/create/', views.api_create_project, name='api_create_project'),
    path('api/projects/<int:project_id>/', views.api_project_detail, name='api_project_detail'),
    path('api/projects/<int:project_id>/envelope/', views.api_update_envelope, name='api_update_envelope'),
    path('api/projects/<int:project_id>/status/', views.api_project_status, name='api_project_status'),
    path('api/projects/<int:project_id>/delete/', views.api_delete_project, name='api_delete_project'),
    path('api/projects/<int:project_id>/audio-data/', views.api_project_audio_data, name='api_project_audio_data'),
]