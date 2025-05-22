import unittest
from python_gib.src.core import foo

class TestCore(unittest.TestCase):
    def test_foo(self):
        name = "Test User"
        age = 30
        aliases = ["tester", "example"]
        expected_output = {
            "name": name,
            "age": age,
            "aliases": aliases,
        }
        self.assertEqual(foo(name=name, age=age, aliases=aliases), expected_output)

if __name__ == '__main__':
    unittest.main()
