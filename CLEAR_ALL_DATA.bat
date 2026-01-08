@echo off
echo ========================================
echo  CityVetCare - Clear All Table Data
echo ========================================
echo.
echo WARNING: This will DELETE ALL DATA from all tables!
echo You can then submit new data with a clean database.
echo.
echo Press CTRL+C to cancel, or
pause

echo.
echo Connecting to MySQL and clearing all data...
echo.

mysql -u root -p cityvetcare_db -e "SET FOREIGN_KEY_CHECKS = 0; TRUNCATE TABLE clinic_vaccination_submission; TRUNCATE TABLE vaccination_record; TRUNCATE TABLE announcement; TRUNCATE TABLE adoption_request; TRUNCATE TABLE redemption_request; TRUNCATE TABLE euthanized_animals; TRUNCATE TABLE stray_animals; TRUNCATE TABLE patrol_schedule; TRUNCATE TABLE incident_assessment; TRUNCATE TABLE report_image; TRUNCATE TABLE incident_pet; TRUNCATE TABLE incident_report; TRUNCATE TABLE incident_location; TRUNCATE TABLE reporter; TRUNCATE TABLE pet; TRUNCATE TABLE private_clinic; TRUNCATE TABLE dog_catcher; TRUNCATE TABLE pet_owner; TRUNCATE TABLE administrator; SET FOREIGN_KEY_CHECKS = 1;"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo  SUCCESS: All data has been cleared!
    echo ========================================
    echo.
    echo All tables are now empty and ready for new data.
) else (
    echo.
    echo ========================================
    echo  ERROR: Failed to clear data!
    echo ========================================
    echo.
    echo Please check your MySQL connection and try again.
)

echo.
pause
