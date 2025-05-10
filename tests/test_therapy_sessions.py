from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import unittest
import time
from datetime import datetime
import sys
from unittest.runner import TextTestResult

class CustomTestResult(TextTestResult):
    def __init__(self, stream, descriptions, verbosity):
        super().__init__(stream, descriptions, verbosity)
        self.start_time = None
        self.test_results = []

    def startTest(self, test):
        self.start_time = time.time()
        super().startTest(test)

    def addSuccess(self, test):
        elapsed_time = time.time() - self.start_time
        self.test_results.append({
            'name': test.id().split('.')[-1],
            'result': 'PASS',
            'time': f"{elapsed_time:.2f}s"
        })
        super().addSuccess(test)

    def addError(self, test, err):
        elapsed_time = time.time() - self.start_time
        self.test_results.append({
            'name': test.id().split('.')[-1],
            'result': 'ERROR',
            'time': f"{elapsed_time:.2f}s",
            'error': str(err[1])
        })
        super().addError(test, err)

    def addFailure(self, test, err):
        elapsed_time = time.time() - self.start_time
        self.test_results.append({
            'name': test.id().split('.')[-1],
            'result': 'FAIL',
            'time': f"{elapsed_time:.2f}s",
            'error': str(err[1])
        })
        super().addFailure(test, err)

class TestTherapySessions(unittest.TestCase):
    def setUp(self):
        self.driver = webdriver.Chrome()
        self.driver.maximize_window()
        self.driver.implicitly_wait(10)
        self.base_url = "http://localhost:3000"
        
        # Login first
        self.driver.get(f"{self.base_url}/login")
        email_input = self.driver.find_element(By.ID, "email-address")
        email_input.send_keys("adamjoan@gmail.com")  # Replace with valid therapist email
        password_input = self.driver.find_element(By.ID, "password")
        password_input.send_keys("9I@aAqtVXIzj")  # Replace with valid therapist password
        login_button = self.driver.find_element(
            By.XPATH, 
            "//button[contains(text(), 'Sign in to your account')]"
        )
        login_button.click()
        
        # Wait for dashboard to load
        WebDriverWait(self.driver, 10).until(
            EC.url_contains("/dashboard")
        )
        
        # Navigate to sessions page
        self.driver.get(f"{self.base_url}/therapist/sessions")
        
    def tearDown(self):
        self.driver.quit()

    def test_view_session_requests(self):
        """Test that session requests are displayed correctly"""
        # Wait for session requests to load
        session_requests = WebDriverWait(self.driver, 10).until(
            EC.presence_of_all_elements_located((By.CLASS_NAME, "border"))
        )
        
        # Verify at least one session request is displayed
        self.assertTrue(len(session_requests) > 0)
        
        # Verify session request contains required elements
        for request in session_requests:
            self.assertTrue(request.find_element(By.CLASS_NAME, "text-xl").is_displayed())  # Client name
            self.assertTrue(request.find_element(By.CLASS_NAME, "text-sm").is_displayed())  # Request date
            self.assertTrue(request.find_element(By.CLASS_NAME, "bg-gray-50").is_displayed())  # Session details

    def test_confirm_booking(self):
        """Test confirming a booking request"""
        # Find first pending booking
        pending_booking = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//div[contains(@class, 'border')]//button[contains(text(), 'Accept')]"))
        )
        pending_booking.click()
        
        # Wait for confirmation modal
        modal = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "bg-white"))
        )
        
        # Verify modal contains required elements
        self.assertTrue(modal.find_element(By.CLASS_NAME, "text-xl").is_displayed())
        self.assertTrue(modal.find_element(By.CLASS_NAME, "text-sm").is_displayed())
        
        # Click confirm button
        confirm_button = modal.find_element(By.XPATH, "//button[contains(text(), 'Confirm')]")
        confirm_button.click()
        
        # Verify booking status changed to confirmed
        status_badge = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//span[contains(@class, 'bg-green-100')]"))
        )
        self.assertIn("Confirmed", status_badge.text)

    def test_complete_session(self):
        """Test completing a session and adding notes"""
        # Find first confirmed session
        complete_button = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//button[contains(text(), 'Complete Session')]"))
        )
        complete_button.click()
        
        # Wait for notes modal
        notes_modal = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "bg-white"))
        )
        
        # Fill in session notes
        notes_textarea = notes_modal.find_element(By.TAG_NAME, "textarea")
        notes_textarea.send_keys("Test session notes")
        
        # Fill in payment details
        payment_amount = notes_modal.find_element(By.XPATH, "//input[@type='number']")
        payment_amount.send_keys("1000")
        
        payment_description = notes_modal.find_element(By.XPATH, "//textarea[contains(@class, 'h-20')]")
        payment_description.send_keys("Test payment description")
        
        # Click save button
        save_button = notes_modal.find_element(By.XPATH, "//button[contains(text(), 'Complete Session')]")
        save_button.click()
        
        # Verify session status changed to completed
        status_badge = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//span[contains(@class, 'bg-blue-100')]"))
        )
        self.assertIn("Completed", status_badge.text)

    def test_add_additional_notes(self):
        """Test adding additional notes to a completed session"""
        # Find first completed session
        add_notes_button = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//button[contains(text(), 'Add Notes')]"))
        )
        add_notes_button.click()
        
        # Wait for notes modal
        notes_modal = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "bg-white"))
        )
        
        # Fill in additional notes
        notes_textarea = notes_modal.find_element(By.TAG_NAME, "textarea")
        notes_textarea.send_keys("Additional test notes")
        
        # Click save button
        save_button = notes_modal.find_element(By.XPATH, "//button[contains(text(), 'Save Additional Notes')]")
        save_button.click()
        
        # Verify success message
        success_message = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//div[contains(@class, 'bg-green-100')]"))
        )
        self.assertIn("Additional notes saved successfully", success_message.text)

    def test_verify_notes_integrity(self):
        """Test verifying notes integrity for a completed session"""
        # Find first completed session with notes
        verify_button = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//button[contains(text(), 'Verify Notes Integrity')]"))
        )
        verify_button.click()
        
        # Wait for verification result
        result_message = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//div[contains(@class, 'bg-green-100')]"))
        )
        self.assertIn("Notes integrity verified successfully", result_message.text)

def print_results(result):
    print("\n" + "="*80)
    print(f"Test Run Summary - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*80)
    
    print("\nTest Results:")
    print("-"*80)
    print(f"{'Test Name':<40} {'Result':<10} {'Time':<10}")
    print("-"*80)
    
    for test_result in result.test_results:
        name = test_result['name']
        result_status = test_result['result']
        time_taken = test_result['time']
        print(f"{name:<40} {result_status:<10} {time_taken:<10}")
        if 'error' in test_result:
            print(f"\nError details for {name}:")
            print(f"{test_result['error']}\n")
    
    print("-"*80)
    print(f"\nTotal Tests: {result.testsRun}")
    print(f"Passed: {len([t for t in result.test_results if t['result'] == 'PASS'])}")
    print(f"Failed: {len([t for t in result.test_results if t['result'] == 'FAIL'])}")
    print(f"Errors: {len([t for t in result.test_results if t['result'] == 'ERROR'])}")
    print("="*80 + "\n")

if __name__ == "__main__":
    # Create a test suite
    suite = unittest.TestLoader().loadTestsFromTestCase(TestTherapySessions)
    
    # Create a runner that uses our custom result class
    runner = unittest.TextTestRunner(resultclass=CustomTestResult)
    
    # Run the tests
    result = runner.run(suite)
    
    # Print the formatted results
    print_results(result)
    
    # Set exit code based on test results
    sys.exit(not result.wasSuccessful()) 