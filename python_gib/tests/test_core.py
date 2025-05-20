import unittest
from python_gib.src.core import foo

class TestCore(unittest.TestCase):
    def test_foo(self):
        self.assertEqual(foo(), "bar")

if __name__ == '__main__':
    unittest.main()
