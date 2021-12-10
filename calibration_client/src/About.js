import React from "react";
import { Link } from "react-router-dom";

export function About() {
  return (
    <>
      <main>
        <h2>About</h2>
        <p>
          Lorem ipsum
        </p>
      </main>
      <nav>
        <Link to="/">Home</Link>
      </nav>
    </>
  );
}
