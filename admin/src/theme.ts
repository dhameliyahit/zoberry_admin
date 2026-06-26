import { createTheme } from "@mui/material/styles";

const getTheme = (darkMode: boolean) =>
  createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: darkMode ? "#ffffff" : "#000000",
        light: darkMode ? "#cccccc" : "#333333",
        dark: darkMode ? "#ffffff" : "#000000",
        contrastText: darkMode ? "#000000" : "#ffffff",
      },
      error: {
        main: darkMode ? "#ef4444" : "#dc2626",
        light: darkMode ? "#f87171" : "#ef4444",
        dark: darkMode ? "#dc2626" : "#b91c1c",
      },
      success: {
        main: darkMode ? "#22c55e" : "#16a34a",
        light: darkMode ? "#4ade80" : "#22c55e",
        dark: darkMode ? "#16a34a" : "#15803d",
      },
      warning: {
        main: darkMode ? "#f59e0b" : "#d97706",
        light: darkMode ? "#fbbf24" : "#f59e0b",
        dark: darkMode ? "#d97706" : "#b45309",
      },
      background: {
        default: darkMode ? "#000000" : "#f5f5f5",
        paper: darkMode ? "#111111" : "#ffffff",
      },
      text: {
        primary: darkMode ? "#ffffff" : "#000000",
        secondary: darkMode ? "#aaaaaa" : "#666666",
        disabled: darkMode ? "#555555" : "#999999",
      },
      divider: darkMode ? "#222222" : "#e0e0e0",
      action: {
        hover: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
        selected: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
        disabledBackground: darkMode ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
        focus: darkMode ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
      },
    },
    typography: {
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      h4: {
        fontWeight: 700,
        fontSize: "1.5rem",
        letterSpacing: "-0.02em",
      },
      h5: {
        fontWeight: 700,
        fontSize: "1.25rem",
        letterSpacing: "-0.01em",
      },
      h6: {
        fontWeight: 700,
        fontSize: "1.1rem",
      },
      body2: {
        fontSize: "0.875rem",
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            backgroundColor: darkMode ? "#111111" : "#ffffff",
          },
          notchedOutline: {
            borderColor: darkMode ? "#333333" : "#e0e0e0",
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: darkMode ? "#aaaaaa" : "#666666",
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            "& .MuiTableCell-root": {
              backgroundColor: darkMode ? "#0a0a0a" : "#f5f5f5",
              fontWeight: 600,
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: darkMode ? "#aaaaaa" : "#666666",
              borderBottom: `1px solid ${darkMode ? "#222222" : "#e0e0e0"}`,
            },
          },
        },
      },
      MuiTableBody: {
        styleOverrides: {
          root: {
            "& .MuiTableCell-root": {
              borderBottom: `1px solid ${darkMode ? "#222222" : "#e0e0e0"}`,
              color: darkMode ? "#ffffff" : "#000000",
              fontSize: "0.875rem",
              padding: "12px 16px",
            },
            "& .MuiTableRow-root:hover": {
              backgroundColor: darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            fontSize: "0.75rem",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 8,
            boxShadow: "none",
            "&:hover": {
              boxShadow: "none",
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 12,
            border: `1px solid ${darkMode ? "#333333" : "#e0e0e0"}`,
          },
        },
      },
      MuiTablePagination: {
        styleOverrides: {
          root: {
            color: darkMode ? "#aaaaaa" : "#666666",
          },
          selectLabel: {
            color: darkMode ? "#aaaaaa" : "#666666",
          },
          displayedRows: {
            color: darkMode ? "#aaaaaa" : "#666666",
          },
          select: {
            color: darkMode ? "#aaaaaa" : "#666666",
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontSize: "0.875rem",
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 8,
            border: `1px solid ${darkMode ? "#333333" : "#e0e0e0"}`,
            marginTop: 4,
          },
        },
      },
    },
  });

export default getTheme;
