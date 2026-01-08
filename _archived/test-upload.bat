@echo off
echo ================================
echo Testing Image Upload Endpoint
echo ================================
echo.
echo Creating test image...

:: Create a small test image (base64 encoded 1x1 pixel PNG)
echo iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg== > test-image-base64.txt
certutil -decode test-image-base64.txt test-upload.png >nul 2>&1

if not exist test-upload.png (
    echo Error: Failed to create test image
    exit /b 1
)

echo Test image created: test-upload.png
echo.
echo Testing upload endpoint...
echo URL: http://192.168.0.108:3000/api/incidents/upload-images
echo.

:: Test the upload endpoint using curl
curl -X POST ^
  -F "images=@test-upload.png" ^
  http://192.168.0.108:3000/api/incidents/upload-images

echo.
echo.
echo ================================
echo Test Complete
echo ================================

:: Cleanup
del test-image-base64.txt >nul 2>&1
del test-upload.png >nul 2>&1

pause
