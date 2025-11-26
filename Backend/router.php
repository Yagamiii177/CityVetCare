<?php
/**
 * PHP Development Server Router
 * Routes requests to the appropriate files
 */

// Get the requested URI
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Route to the appropriate file
if (preg_match('#^/routes/(.+)\.php$#', $uri, $matches)) {
    $file = __DIR__ . '/routes/' . $matches[1] . '.php';
    if (file_exists($file)) {
        require $file;
        return true;
    }
}

// Default: return false to let PHP handle it normally
return false;
