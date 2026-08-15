import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 36,
          background: "#0b1220",
        }}
      >
          <span
            style={{
              color: "#38bdf8",
              fontSize: 82,
              fontWeight: 700,
              fontFamily: "Arial",
              lineHeight: 1,
            }}
          >
            SH
          </span>
      </div>
    ),
    size,
  );
}
