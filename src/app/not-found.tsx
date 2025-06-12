import Link from "next/link";

export default function RootNotFound() {
    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "2rem",
                textAlign: "center",
            }}
        >
            <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>404</h1>
            <p style={{ fontSize: "1.25rem", marginBottom: "2rem" }}>
                Page not found
            </p>
            <Link
                href="/"
                style={{
                    padding: "0.75rem 1.5rem",
                    backgroundColor: "#2563eb",
                    color: "white",
                    borderRadius: "0.5rem",
                    textDecoration: "none",
                }}
            >
                Go to Home
            </Link>
        </div>
    );
}
