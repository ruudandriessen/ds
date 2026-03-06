import { describe, expect, test } from "bun:test";

import {
  addEdge,
  addNode,
  createGraph,
  emptyGraph,
  getIncomingEdges,
  getOutgoingEdges,
} from "./index.ts";

describe("graph", () => {
  test("builds a graph with typed nodes and edges", () => {
    type Node = { id: "a" | "b"; label: string };
    type Edge = { id: "a->b"; from: "a"; to: "b"; weight: number };

    const graph = createGraph<Node, Edge>({
      nodes: [
        { id: "a", label: "A" },
        { id: "b", label: "B" },
      ],
      edges: [{ id: "a->b", from: "a", to: "b", weight: 1 }],
    });

    expect(graph.nodes.get("a")?.label).toBe("A");
    expect(graph.edges.get("a->b")?.weight).toBe(1);
    expect(getOutgoingEdges(graph, "a")).toHaveLength(1);
    expect(getIncomingEdges(graph, "b")).toHaveLength(1);
  });

  test("returns a new graph when adding nodes and edges", () => {
    type Node = { id: "source" | "target"; name: string };
    type Edge = {
      id: "link";
      from: "source";
      to: "target";
      relation: "connects";
    };

    const start = emptyGraph<Node, Edge>();
    const withNodes = addNode(
      addNode(start, { id: "source", name: "Source" }),
      { id: "target", name: "Target" },
    );
    const withEdge = addEdge(withNodes, {
      id: "link",
      from: "source",
      to: "target",
      relation: "connects",
    });

    expect(start.nodes.size).toBe(0);
    expect(withNodes.nodes.size).toBe(2);
    expect(withEdge.edges.size).toBe(1);
    expect(getOutgoingEdges(withEdge, "source")[0]?.to).toBe("target");
  });

  test("rejects edges that point at missing nodes", () => {
    type Node = { id: string; label: string };
    type Edge = { id: string; from: string; to: string; weight: number };

    const graph = createGraph<Node, Edge>({
      nodes: [{ id: "a", label: "A" }],
    });

    expect(() =>
      addEdge(graph, { id: "broken", from: "a", to: "missing", weight: 1 }),
    ).toThrow("Unknown node: missing");
  });
});
