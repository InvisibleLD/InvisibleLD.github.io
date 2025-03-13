/*  
 * TinyFilmFestival - Distance-Based Expand & Shrink Animation
 * 
 * Uses HC-SR04 ultrasonic sensor to switch between two animations:
 * - "ExpandCircleAnimation" when the user is far (放大).
 * - "ShrinkCircleAnimation" when the user is close (缩小).
 */

#include "TinyFilmFestival.h"
#include "HCSR04.h"
#include "ExpandCircleAnimation.h"  // 放大 Animation (Expanding Circle)
#include "ShrinkCircleAnimation.h"  // 缩小 Animation (Shrinking Circle)

// Create instance of TinyFilmFestival
TinyFilmFestival film;

// Distance sensor setup
int triggerPin = 14;          // A0 Trigger pin
int echoPin = 15;             // A1 Echo pin 
int maxDistance = 200;        // Maximum distance to measure (cm)
UltraSonicDistanceSensor distanceSensor(triggerPin, echoPin, maxDistance);

// Distance threshold for switching animation
float switchDistance = 5.0;  // Switch animation if object is within 5 cm

// Sensor read timing control
int sensorInterval = 100;       // How often to read sensor (ms)
unsigned long lastSensorRead = 0;     // Last sensor reading time
float currentDistance = 0.0;          // Variable to store distance reading
bool isPlayingShrink = false;         // Track which animation is playing

void setup() 
{
    // Initialize serial for debug output
    Serial.begin(9600);
    
    // Initialize the LED matrix
    film.begin();
    
    // Start with expand animation playing in loop mode
    film.startAnimation(ExpandCircleAnimation, LOOP);
    Serial.println("ExpandCircleAnimation started");
}

void loop() 
{
    // Read distance value with timing control
    float distance = readDistance();
    
    if (distance >= 0) // Ensure valid distance reading
    {
        Serial.print("Distance : ");
        Serial.print(distance);
        Serial.println(" cm");

        // Check if the object is within the switch range
        if (distance <= switchDistance) 
        {
            if (!isPlayingShrink) 
            {
                film.startAnimation(ShrinkCircleAnimation, LOOP); // Switch to ShrinkCircleAnimation
                isPlayingShrink = true;
                Serial.println("Switched to ShrinkCircleAnimation");
            }
        }
        else 
        {
            if (isPlayingShrink) 
            {
                film.startAnimation(ExpandCircleAnimation, LOOP); // Switch back to ExpandCircleAnimation
                isPlayingShrink = false;
                Serial.println("Switched back to ExpandCircleAnimation");
            }
        }
    }
    
    // Update the animation frame
    film.update();
}

// Reads distance from the HC-SR04 sensor at specified intervals
float readDistance()
{
    unsigned long currentTime = millis();
    
    // Only read sensor if interval has elapsed
    if (currentTime - lastSensorRead >= sensorInterval)
    {
        currentDistance = distanceSensor.measureDistanceCm();
        lastSensorRead = currentTime;
    }
    
    return currentDistance;
}