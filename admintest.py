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

class TestLogin(unittest.TestCase):
    def setUp(self):
        self.driver = webdriver.Chrome()
        self.driver.maximize_window()
        self.driver.implicitly_wait(10)
        self.base_url = "http://localhost:3000"
        
    def tearDown(self):
        self.driver.quit()

    def test_successful_login(self):
        # Navigate to login page
        self.driver.get(f"{self.base_url}/login")
        
        # Find and fill in email field
        email_input = self.driver.find_element(By.ID, "email-address")
        email_input.send_keys("test@example.com")  # Replace with valid test email
        
        # Find and fill in password field
        password_input = self.driver.find_element(By.ID, "password")
        password_input.send_keys("testpassword123")  # Replace with valid test password
        
        # Click login button
        login_button = self.driver.find_element(
            By.XPATH, 
            "//button[contains(text(), 'Sign in to your account')]"
        )
        login_button.click()
        
        # Wait for either dashboard redirect or error message
        try:
            # First check if we get redirected to dashboard
            WebDriverWait(self.driver, 5).until(
                EC.url_contains("/dashboard")
            )
            self.assertTrue("/dashboard" in self.driver.current_url)
        except:
            # If not redirected, we should see an error message
            error_element = WebDriverWait(self.driver, 5).until(
                EC.presence_of_element_located((By.CLASS_NAME, "bg-red-100"))
            )
            self.assertTrue(error_element.is_displayed())

    def test_invalid_credentials(self):
        # Navigate to login page
        self.driver.get(f"{self.base_url}/login")
        
        # Find and fill in email field with invalid credentials
        email_input = self.driver.find_element(By.ID, "email-address")
        email_input.send_keys("wrong@example.com")
        
        # Find and fill in password field
        password_input = self.driver.find_element(By.ID, "password")
        password_input.send_keys("wrongpassword")
        
        # Click login button
        login_button = self.driver.find_element(
            By.XPATH, 
            "//button[contains(text(), 'Sign in to your account')]"
        )
        login_button.click()
        
        # Wait for error message to appear
        error_message = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "bg-red-100"))
        )
        
        # Verify error message is displayed and contains expected text
        self.assertTrue(error_message.is_displayed())
        self.assertIn("Invalid email or password", error_message.text)

    def test_google_login_button_exists(self):
        # Navigate to login page
        self.driver.get(f"{self.base_url}/login")
        
        # Find Google login button
        google_button = self.driver.find_element(
            By.XPATH, 
            "//button[contains(text(), 'Sign in with Google')]"
        )
        
        # Verify button is displayed
        self.assertTrue(google_button.is_displayed())

    def test_forgot_password_link(self):
        # Navigate to login page
        self.driver.get(f"{self.base_url}/login")
        
        # Find and click forgot password link
        forgot_password_button = self.driver.find_element(
            By.XPATH, 
            "//button[contains(text(), 'Forgot password?')]"
        )
        forgot_password_button.click()
        
        # Wait for reset email input to be visible
        reset_email_input = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.ID, "reset-email"))
        )
        
        # Verify reset password form is displayed
        self.assertTrue(reset_email_input.is_displayed())

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
    suite = unittest.TestLoader().loadTestsFromTestCase(TestLogin)
    
    # Create a runner that uses our custom result class
    runner = unittest.TextTestRunner(resultclass=CustomTestResult)
    
    # Run the tests
    result = runner.run(suite)
    
    # Print the formatted results
    print_results(result)
    
    # Set exit code based on test results
    sys.exit(not result.wasSuccessful())