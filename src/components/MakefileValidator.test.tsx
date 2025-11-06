/** @jest-environment jsdom */
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import MakefileValidator from "./MakefileValidator";

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => "mock-url");
global.URL.revokeObjectURL = jest.fn();

describe("MakefileValidator", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("renders without crashing", () => {
    render(<MakefileValidator />);
    expect(screen.getByText("Makefile Validator")).toBeInTheDocument();
  });

  it("renders all main UI elements", () => {
    render(<MakefileValidator />);
    expect(screen.getByText("Makefile Validator")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Validate Makefile syntax, check for common errors, and analyze structure"
      )
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Paste your Makefile here...")).toBeInTheDocument();
    expect(screen.getByText("Load Sample")).toBeInTheDocument();
    expect(screen.getByText("Issues")).toBeInTheDocument();
    expect(screen.getByText("Structure")).toBeInTheDocument();
  });

  describe("Validation Logic", () => {
    it("shows no issues for empty input", () => {
      render(<MakefileValidator />);
      expect(screen.getByText("Enter a Makefile to validate")).toBeInTheDocument();
    });

    it("validates a correct simple Makefile", async () => {
      render(<MakefileValidator />);
      const textarea = screen.getByPlaceholderText("Paste your Makefile here...");

      const validMakefile = `all: main.o
\tgcc -o program main.o

main.o: main.c
\tgcc -c main.c`;

      fireEvent.change(textarea, { target: { value: validMakefile } });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByText("Valid Makefile")).toBeInTheDocument();
      });
    });

    it("detects recipe line without target", async () => {
      render(<MakefileValidator />);
      const textarea = screen.getByPlaceholderText("Paste your Makefile here...");

      const invalidMakefile = `\tgcc -o program main.o`;

      fireEvent.change(textarea, { target: { value: invalidMakefile } });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByText(/Recipe line without a target/)).toBeInTheDocument();
      });
    });

    it("detects spaces instead of tabs in recipes", async () => {
      render(<MakefileValidator />);
      const textarea = screen.getByPlaceholderText("Paste your Makefile here...");

      const invalidMakefile = `all: main.o
    gcc -o program main.o`;

      fireEvent.change(textarea, { target: { value: invalidMakefile } });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(
          screen.getByText(/Recipe line starts with spaces instead of a tab/)
        ).toBeInTheDocument();
      });
    });

    it("detects empty target name", async () => {
      render(<MakefileValidator />);
      const textarea = screen.getByPlaceholderText("Paste your Makefile here...");

      const invalidMakefile = `: dependency
\tcommand`;

      fireEvent.change(textarea, { target: { value: invalidMakefile } });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByText(/Empty target name/)).toBeInTheDocument();
      });
    });

    it("detects target name with spaces", async () => {
      render(<MakefileValidator />);
      const textarea = screen.getByPlaceholderText("Paste your Makefile here...");

      const invalidMakefile = `my target: dependency
\tcommand`;

      fireEvent.change(textarea, { target: { value: invalidMakefile } });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByText(/Target name contains spaces/)).toBeInTheDocument();
      });
    });

    it("warns about targets without recipes", async () => {
      render(<MakefileValidator />);
      const textarea = screen.getByPlaceholderText("Paste your Makefile here...");

      const makefileWithoutRecipes = `all: dependency

dependency:`;

      fireEvent.change(textarea, { target: { value: makefileWithoutRecipes } });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByText(/Target "all" has no recipes/)).toBeInTheDocument();
        expect(screen.getByText(/Target "dependency" has no recipes/)).toBeInTheDocument();
      });
    });

    it("handles comments correctly", async () => {
      render(<MakefileValidator />);
      const textarea = screen.getByPlaceholderText("Paste your Makefile here...");

      const makefileWithComments = `# This is a comment
all: main.o
\t# This is also a comment
\tgcc -o program main.o`;

      fireEvent.change(textarea, { target: { value: makefileWithComments } });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByText("Valid Makefile")).toBeInTheDocument();
      });
    });

    it("handles variable assignments correctly", async () => {
      render(<MakefileValidator />);
      const textarea = screen.getByPlaceholderText("Paste your Makefile here...");

      const makefileWithVars = `CC = gcc
CFLAGS = -Wall
TARGET := myprogram

all: $(TARGET)
\t$(CC) $(CFLAGS) -o $@ $^`;

      fireEvent.change(textarea, { target: { value: makefileWithVars } });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByText("Valid Makefile")).toBeInTheDocument();
      });
    });
  });

  describe("Line Numbers", () => {
    it("shows line numbers by default", () => {
      render(<MakefileValidator />);
      const checkbox = screen.getByRole("checkbox", { name: /show line numbers/i });
      expect(checkbox).toBeChecked();
    });

    it("toggles line numbers when checkbox is clicked", () => {
      render(<MakefileValidator />);
      const checkbox = screen.getByRole("checkbox", { name: /show line numbers/i });

      expect(checkbox).toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it("renders line numbers with correct height constraint", () => {
      render(<MakefileValidator />);
      const textarea = screen.getByPlaceholderText("Paste your Makefile here...");

      const makefile = `line1
line2
line3`;

      fireEvent.change(textarea, { target: { value: makefile } });

      // Find the line numbers container
      const lineNumbersContainer = textarea.parentElement?.querySelector('.absolute');

      expect(lineNumbersContainer).toBeInTheDocument();
      expect(lineNumbersContainer).toHaveClass('h-[600px]');
      expect(lineNumbersContainer).toHaveClass('overflow-hidden');
    });

    it("renders correct number of line numbers", () => {
      render(<MakefileValidator />);
      const textarea = screen.getByPlaceholderText("Paste your Makefile here...");

      const makefile = `line1
line2
line3
line4
line5`;

      fireEvent.change(textarea, { target: { value: makefile } });

      // Find all line number elements
      const lineNumbersContainer = textarea.parentElement?.querySelector('.absolute');
      const lineNumberDivs = lineNumbersContainer?.querySelectorAll('div');

      expect(lineNumberDivs?.length).toBe(5);
    });

    it("does not render line numbers when checkbox is unchecked", () => {
      render(<MakefileValidator />);
      const textarea = screen.getByPlaceholderText("Paste your Makefile here...");
      const checkbox = screen.getByRole("checkbox", { name: /show line numbers/i });

      fireEvent.change(textarea, { target: { value: "line1\nline2" } });

      // Uncheck the checkbox
      fireEvent.click(checkbox);

      // Line numbers container should not be rendered
      const lineNumbersContainer = textarea.parentElement?.querySelector('.absolute');
      expect(lineNumbersContainer).not.toBeInTheDocument();
    });

    it("updates line numbers count when content changes", () => {
      render(<MakefileValidator />);
      const textarea = screen.getByPlaceholderText("Paste your Makefile here...");

      fireEvent.change(textarea, { target: { value: "line1\nline2" } });

      let lineNumbersContainer = textarea.parentElement?.querySelector('.absolute');
      let lineNumberDivs = lineNumbersContainer?.querySelectorAll('div');
      expect(lineNumberDivs?.length).toBe(2);

      // Add more lines
      fireEvent.change(textarea, { target: { value: "line1\nline2\nline3\nline4" } });

      lineNumbersContainer = textarea.parentElement?.querySelector('.absolute');
      lineNumberDivs = lineNumbersContainer?.querySelectorAll('div');
      expect(lineNumberDivs?.length).toBe(4);
    });
  });
});
