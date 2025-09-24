# Audio Wave Studio - Django Application

A comprehensive Django web application that integrates the original audio processing script functionality with both web interface and REST API capabilities.

## Features

### Web Interface
- **Gallery View**: Browse all audio projects with timestamps and previews
- **Project Creation**: Upload audio files or generate custom waveforms
- **Interactive Visualizer**: Real-time envelope editing with canvas drawing
- **Project Details**: View all visualizations, audio files, and metadata
- **Color Customization**: Choose from tech-inspired color palettes

### API Endpoints
- `GET /api/projects/` - List all projects
- `POST /api/projects/create/` - Create new project
- `GET /api/projects/{id}/` - Get project details
- `PUT /api/projects/{id}/envelope/` - Update envelope data
- `GET /api/projects/{id}/status/` - Check processing status
- `DELETE /api/projects/{id}/delete/` - Delete project

### Audio Processing Features
- **Custom Wave Generation**: Sine, square, triangle, sawtooth waves
- **File Upload Support**: WAV, MP3, FLAC formats
- **Envelope Editing**: Draw positive and negative envelopes
- **Multiple Visualizations**:
  - Final drawing with envelope overlays
  - Natural language view with sign-based coloring
  - Wave comparison (original vs modified)
- **Export Options**: PNG, SVG, and audio file downloads

## Installation & Setup

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run Migrations**:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

3. **Create Superuser**:
   ```bash
   python manage.py createsuperuser
   ```

4. **Start Development Server**:
   ```bash
   python manage.py runserver
   ```

5. **Access the Application**:
   - Web Interface: http://localhost:8000/
   - Admin Panel: http://localhost:8000/admin/
   - API Documentation: http://localhost:8000/api/projects/

## Directory Structure

```
Project-Wave/
├── application/
│   ├── models.py          # AudioProject model
│   ├── views.py           # Web views and API endpoints
│   ├── serializers.py     # REST API serializers
│   ├── audio_processor.py # Core audio processing logic
│   ├── admin.py           # Django admin configuration
│   └── templates/
│       └── application/
│           ├── base.html
│           ├── gallery.html
│           ├── create_project.html
│           ├── project_detail.html
│           ├── visualize.html
│           └── confirm_delete.html
├── media/                 # Uploaded and generated files
├── static/               # Static assets
├── Project-Wave/
│   ├── settings.py       # Django configuration
│   └── urls.py          # URL routing
└── requirements.txt      # Python dependencies
```

## Key Features from Original Script

### 1. Custom Wave Generation
- Preserved all wave type presets (sine, square, triangle, sawtooth)
- Maintains original parameter controls (frequency, samples per wave, periods)
- Same mathematical wave generation algorithms

### 2. Color Management
- Full tech color palette from original script
- RGB color picker integration
- Preset color selection system

### 3. Envelope Drawing
- Interactive canvas-based envelope editing
- Positive/negative envelope separation
- Real-time preview capabilities

### 4. Visualization Types
- **Final Drawing**: Shows original wave + drawn envelopes
- **Natural Language**: Sign-based coloring for modified wave
- **Wave Comparison**: Original vs modified side-by-side

### 5. File Management
- Automatic folder creation per project (similar to original script)
- All file types preserved: audio, PNG, SVG, CSV
- Organized media storage structure

## Database Schema

### AudioProject Model
```python
- name: Project identifier
- description: Optional project description
- wave_type: Type of wave (uploaded/sine/square/triangle/sawtooth)
- wave_parameters: JSON field for custom wave settings
- envelope_data: JSON field for positive/negative envelope arrays
- color settings: Background, positive, negative colors
- file fields: Original audio, modified audio, visualizations
- timestamps: Created/updated timestamps
- processing status: Track background processing
```

## API Usage Examples

### Create a New Project
```python
import requests

data = {
    "name": "My Audio Project",
    "description": "Test project",
    "wave_type": "sine",
    "wave_parameters": {
        "freq": 440,
        "spw": 100,
        "periods": 10
    },
    "background_color": "#000000",
    "positive_color": "#00FF00",
    "negative_color": "#00FFFF"
}

response = requests.post("http://localhost:8000/api/projects/create/", json=data)
```

### Update Envelope Data
```python
envelope_data = {
    "envelope_data": {
        "positive": [0.1, 0.2, 0.3, ...],
        "negative": [-0.1, -0.2, -0.3, ...]
    }
}

response = requests.put(
    f"http://localhost:8000/api/projects/{project_id}/envelope/", 
    json=envelope_data
)
```

## Admin Interface

Access the Django admin at `/admin/` to:
- View all projects and their metadata
- Monitor processing status
- Manage file uploads
- Debug envelope data
- View system logs

## Technology Stack

- **Backend**: Django 5.1.4, Django REST Framework
- **Audio Processing**: NumPy, SciPy, Matplotlib
- **Frontend**: Bootstrap 5, jQuery, Font Awesome
- **Database**: SQLite (default), PostgreSQL compatible
- **File Storage**: Django file handling with media directory

## Future Enhancements

1. **Real-time Collaboration**: WebSocket support for shared editing
2. **Audio Streaming**: Web Audio API integration
3. **Advanced Filters**: Additional audio processing effects
4. **Export Formats**: Additional audio and image formats
5. **Batch Processing**: Multiple file processing queues
6. **User Authentication**: Multi-user support with permissions

## License

This project integrates and extends the original audio processing script functionality within a modern Django framework, maintaining all core features while adding web and API capabilities.