"use client";
import { useEffect, useState } from "react";

export default function TestPage() {
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/r2/list")
            .then(res => res.json())
            .then(json => {
                if (json.error) setError(json.error);
                else setData(json);
            })
            .catch(err => setError(err.message));
    }, []);

    return (
        <div style={{ padding: 20 }}>
            <h1>R2 Connection Test</h1>
            {error && <pre style={{ color: "red" }}>{error}</pre>}
            {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
            {!data && !error && <p>Loading...</p>}
        </div>
    );
}
