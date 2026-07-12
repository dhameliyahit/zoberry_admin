import { useState, useEffect } from "react";
import { configApi } from "../services/config.api";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Divider,
  Stack,
  CircularProgress,
  Alert,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";

const ALL_METHODS = [
  { value: "cod", label: "Cash on Delivery" },
  { value: "uropay", label: "UPI (UroPay)" },
  { value: "directupi", label: "UPI (Scan & Pay)" },
  { value: "netbanking", label: "Netbanking" },
  { value: "card", label: "Card" },
];

export default function PaymentSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [enabledMethods, setEnabledMethods] = useState<string[]>(["cod", "uropay"]);
  const [defaultMethod, setDefaultMethod] = useState("cod");
  const [uroPay, setUroPay] = useState({
    enabled: true,
    mode: "test",
    apiKey: "",
    secret: "",
    vpa: "",
    vpaName: "Zoberry",
  });

  useEffect(() => {
    configApi
      .getPayment()
      .then((res) => {
        const v = res.data?.data || {};
        if (Array.isArray(v.enabledMethods)) setEnabledMethods(v.enabledMethods);
        if (v.defaultMethod) setDefaultMethod(v.defaultMethod);
        if (v.providers?.uropay) setUroPay({ ...uroPay, ...v.providers.uropay });
      })
      .catch((err) => setError(err?.response?.data?.error || "Failed to load config"))
      .finally(() => setLoading(false));
  }, []);

  const toggleMethod = (m: string) => {
    setEnabledMethods((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess(false);
    const payload = {
      enabledMethods,
      defaultMethod: enabledMethods.includes(defaultMethod) ? defaultMethod : enabledMethods[0],
      providers: { uropay: uroPay },
    };
    try {
      await configApi.updatePayment(payload);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to save config");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 1 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Payment Settings
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Payment configuration saved.</Alert>}

      <Paper sx={{ p: 3, mb: 3, borderRadius: "12px" }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          Checkout Payment Methods
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          {ALL_METHODS.map((m) => (
            <FormControlLabel
              key={m.value}
              control={
                <Switch
                  checked={enabledMethods.includes(m.value)}
                  onChange={() => toggleMethod(m.value)}
                />
              }
              label={m.label}
            />
          ))}
        </Stack>
        <Box sx={{ mt: 2, maxWidth: 300 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Default Method</InputLabel>
            <Select
              value={defaultMethod}
              label="Default Method"
              onChange={(e) => setDefaultMethod(e.target.value)}
            >
              {ALL_METHODS.filter((m) => enabledMethods.includes(m.value)).map((m) => (
                <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: "12px" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            UroPay (UPI Gateway)
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={uroPay.enabled}
                onChange={(e) => setUroPay({ ...uroPay, enabled: e.target.checked })}
              />
            }
            label={uroPay.enabled ? "Enabled" : "Disabled"}
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: "grid", gap: 2, maxWidth: 520 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Mode</InputLabel>
            <Select
              value={uroPay.mode}
              label="Mode"
              onChange={(e) => setUroPay({ ...uroPay, mode: e.target.value })}
            >
              <MenuItem value="test">Test</MenuItem>
              <MenuItem value="live">Live</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="API Key"
            size="small"
            value={uroPay.apiKey}
            onChange={(e) => setUroPay({ ...uroPay, apiKey: e.target.value })}
          />
          <TextField
            label="API Secret"
            size="small"
            type="password"
            value={uroPay.secret}
            onChange={(e) => setUroPay({ ...uroPay, secret: e.target.value })}
          />
          <TextField
            label="UPI VPA (e.g. name@bank)"
            size="small"
            value={uroPay.vpa}
            onChange={(e) => setUroPay({ ...uroPay, vpa: e.target.value })}
            helperText="Leave blank to use the VPA configured in your UroPay dashboard."
          />
          <TextField
            label="VPA Display Name"
            size="small"
            value={uroPay.vpaName}
            onChange={(e) => setUroPay({ ...uroPay, vpaName: e.target.value })}
          />
        </Box>

        <Alert severity="info" sx={{ mt: 2 }}>
          Register this webhook URL in your UroPay dashboard (use your storefront
          domain, e.g. <code>https://your-store.com/api/payments/uropay/webhook</code>):
          <br />
          <code>/api/payments/uropay/webhook</code>
        </Alert>
      </Paper>

      <Box sx={{ mt: 3 }}>
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
          disabled={saving}
          onClick={handleSave}
        >
          Save Configuration
        </Button>
      </Box>
    </Box>
  );
}
