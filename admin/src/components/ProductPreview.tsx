import { Box, Typography, Chip, useTheme, alpha, Divider } from "@mui/material";
import {
  Star as StarIcon,
  Visibility as VisibilityIcon,
  PlayCircleOutlined as VideoIcon,
} from "@mui/icons-material";

interface ProductPreviewProps {
  title: string;
  description: string;
  price: number | string;
  compareAtPrice: number | string;
  stock: number | string;
  status: string;
  category: string;
  tags: string[];
  images: { url: string; preview: string; isFeatured: boolean }[];
  videos: { url: string; title: string }[];
  isFeatured: boolean;
}

export default function ProductPreview({
  title,
  description,
  price,
  compareAtPrice,
  stock,
  status,
  category,
  tags,
  images,
  videos,
  isFeatured,
}: ProductPreviewProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const displayImage = images.find((img) => img.isFeatured)?.preview || images[0]?.preview || "";
  const numPrice = Number(price) || 0;
  const numCompare = Number(compareAtPrice) || 0;
  const numStock = Number(stock) || 0;

  const formatPrice = (val: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(val);

  return (
    <Box
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: "10px",
        overflow: "hidden",
        bgcolor: theme.palette.background.paper,
        position: "sticky",
        top: 24,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.text.secondary, textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.7rem" }}>
          Preview
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <VisibilityIcon sx={{ fontSize: 14, color: theme.palette.text.disabled }} />
          <Typography variant="caption" sx={{ color: theme.palette.text.disabled, fontSize: "0.7rem" }}>
            Live
          </Typography>
        </Box>
      </Box>

      {/* Image */}
      <Box sx={{ p: 2, pb: 1.5 }}>
        <Box
          sx={{
            width: "100%",
            height: 200,
            borderRadius: "8px",
            overflow: "hidden",
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: isDark ? alpha("#ffffff", 0.03) : alpha("#000000", 0.02),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {displayImage ? (
            <Box
              component="img"
              src={displayImage}
              alt={title || "Product"}
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <Typography variant="body2" sx={{ color: theme.palette.text.disabled }}>
              No image
            </Typography>
          )}
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ px: 2, pb: 2 }}>
        {/* Category + Status */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          {category && (
            <Chip
              label={category}
              size="small"
              sx={{
                fontSize: "0.65rem",
                height: "20px",
                fontWeight: 600,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: theme.palette.text.secondary,
                border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              }}
            />
          )}
          <Chip
            label={status}
            size="small"
            sx={{
              fontSize: "0.65rem",
              height: "20px",
              fontWeight: 600,
              textTransform: "capitalize",
              bgcolor: status === "active"
                ? alpha(theme.palette.success.main, isDark ? 0.15 : 0.08)
                : status === "draft"
                ? alpha(theme.palette.warning.main, isDark ? 0.15 : 0.08)
                : alpha(theme.palette.text.secondary, 0.08),
              color: status === "active"
                ? theme.palette.success.main
                : status === "draft"
                ? theme.palette.warning.main
                : theme.palette.text.secondary,
            }}
          />
          {isFeatured && (
            <StarIcon sx={{ fontSize: 16, color: theme.palette.warning.main }} />
          )}
        </Box>

        {/* Title */}
        <Typography
          variant="body1"
          sx={{
            fontWeight: 700,
            color: theme.palette.text.primary,
            fontSize: "1rem",
            lineHeight: 1.3,
            mb: 0.5,
            minHeight: "1.3em",
          }}
        >
          {title || "Product Title"}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            fontSize: "0.8rem",
            lineHeight: 1.5,
            mb: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: "2.4em",
          }}
        >
          {description || "Product description will appear here..."}
        </Typography>

        {/* Price */}
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: "1.1rem" }}>
            {numPrice > 0 ? formatPrice(numPrice) : "₹0"}
          </Typography>
          {numCompare > numPrice && numCompare > 0 && (
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.disabled, textDecoration: "line-through", fontSize: "0.8rem" }}
            >
              {formatPrice(numCompare)}
            </Typography>
          )}
        </Box>

        {/* Stock */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: numStock === 0
                ? theme.palette.error.main
                : numStock <= 10
                ? theme.palette.warning.main
                : theme.palette.success.main,
            }}
          />
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: "0.75rem" }}>
            {numStock === 0 ? "Out of stock" : numStock <= 10 ? `Low stock: ${numStock}` : `In stock: ${numStock}`}
          </Typography>
        </Box>

        {/* Tags */}
        {tags.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {tags.slice(0, 5).map((tag, i) => (
              <Chip
                key={i}
                label={tag}
                size="small"
                sx={{
                  fontSize: "0.6rem",
                  height: "18px",
                  bgcolor: isDark ? alpha("#ffffff", 0.05) : alpha("#000000", 0.04),
                  color: theme.palette.text.secondary,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              />
            ))}
            {tags.length > 5 && (
              <Typography variant="caption" sx={{ color: theme.palette.text.disabled, fontSize: "0.65rem", alignSelf: "center" }}>
                +{tags.length - 5} more
              </Typography>
            )}
          </Box>
        )}

        {/* Videos */}
        {videos && videos.length > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
            <VideoIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: "0.75rem" }}>
              {videos.length} video{videos.length > 1 ? "s" : ""}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
