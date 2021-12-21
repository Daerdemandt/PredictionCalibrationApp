import pytest
from common.utils import PROJECT_ROOT


if __name__ == "__main__":
    pytest.main(["--verbosity=1", f"{PROJECT_ROOT}/integration_tests"])
