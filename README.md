# python-gib
For ibgib python-related code.

I'm not going to get to this until other areas of ibgib are further along, but definitely this or mojo is on the roadmap.

## Project Structure

The project has been initialized with a basic Python library structure:

```
python_gib/
├── __init__.py
├── src/
│   ├── __init__.py
│   └── core.py     # Main library code (e.g., foo() function)
└── tests/
    ├── __init__.py
    └── test_core.py # Unit tests for core.py
setup.py             # Package setup information
README.md            # This file
```

- The main library code is located in `python_gib/src/`.
- Unit tests are in `python_gib/tests/`.

## Running Tests

To run the unit tests, navigate to the root directory of the project (the directory containing `setup.py`) and execute the following command in your terminal. This command uses the `unittest` test runner to discover and run all tests within the `python_gib/tests` directory.

```bash
python -m unittest discover -s python_gib/tests
```

Alternatively, you can run a specific test file directly. For example, to run the tests in `test_core.py`:

```bash
python python_gib/tests/test_core.py
```

These commands assume you have Python installed and configured in your system's PATH. The test runner will indicate if all tests pass (`OK`) or provide details of any failures.
