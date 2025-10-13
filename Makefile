VENV=.venv
PY=$(VENV)/bin/python
PIP=$(VENV)/bin/pip

.PHONY: venv install lint test fmt ci clean

venv:
	python3 -m venv $(VENV)
	@echo "Run: source $(VENV)/bin/activate"

install: venv
	$(PIP) install -U pip
	$(PIP) install -r requirements.txt
	$(PIP) install -e .
	$(PIP) install ruff black

lint:
	$(VENV)/bin/ruff check .

fmt:
	$(VENV)/bin/ruff check . --fix
	$(VENV)/bin/black .

test:
	$(VENV)/bin/pytest -q

ci: install lint test

clean:
	rm -rf $(VENV) .pytest_cache **/__pycache__ *.egg-info dist build
