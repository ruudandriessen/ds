export type NodeRecord<NodeId extends PropertyKey = PropertyKey> = Readonly<{
  id: NodeId;
}>;

export type EdgeRecord<
  NodeId extends PropertyKey = PropertyKey,
  EdgeId extends PropertyKey = PropertyKey,
> = Readonly<{
  id: EdgeId;
  from: NodeId;
  to: NodeId;
}>;

export type GraphInput<
  Node extends NodeRecord,
  Edge extends EdgeRecord<Node["id"], PropertyKey>,
> = Readonly<{
  nodes?: Iterable<Node>;
  edges?: Iterable<Edge>;
}>;

export type Graph<
  Node extends NodeRecord,
  Edge extends EdgeRecord<Node["id"], PropertyKey>,
> = Readonly<{
  nodes: ReadonlyMap<Node["id"], Node>;
  edges: ReadonlyMap<Edge["id"], Edge>;
  outgoing: ReadonlyMap<Node["id"], ReadonlySet<Edge["id"]>>;
  incoming: ReadonlyMap<Node["id"], ReadonlySet<Edge["id"]>>;
}>;

export const createGraph = <
  Node extends NodeRecord,
  Edge extends EdgeRecord<Node["id"], PropertyKey>,
>(
  input: GraphInput<Node, Edge> = {},
): Graph<Node, Edge> => {
  let graph = emptyGraph<Node, Edge>();

  for (const node of input.nodes ?? []) {
    graph = addNode(graph, node);
  }

  for (const edge of input.edges ?? []) {
    graph = addEdge(graph, edge);
  }

  return graph;
};

export const emptyGraph = <
  Node extends NodeRecord,
  Edge extends EdgeRecord<Node["id"], PropertyKey>,
>(): Graph<Node, Edge> => ({
  nodes: new Map<Node["id"], Node>(),
  edges: new Map<Edge["id"], Edge>(),
  outgoing: new Map<Node["id"], ReadonlySet<Edge["id"]>>(),
  incoming: new Map<Node["id"], ReadonlySet<Edge["id"]>>(),
});

export const addNode = <
  Node extends NodeRecord,
  Edge extends EdgeRecord<Node["id"], PropertyKey>,
>(
  graph: Graph<Node, Edge>,
  node: Node,
): Graph<Node, Edge> => {
  if (graph.nodes.has(node.id)) {
    throw new Error(`Node already exists: ${String(node.id)}`);
  }

  const nodes = new Map(graph.nodes);
  nodes.set(node.id, node);

  const outgoing = ensureAdjacencyEntry(graph.outgoing, node.id);
  const incoming = ensureAdjacencyEntry(graph.incoming, node.id);

  return {
    nodes,
    edges: graph.edges,
    outgoing,
    incoming,
  };
};

export const addEdge = <
  Node extends NodeRecord,
  Edge extends EdgeRecord<Node["id"], PropertyKey>,
>(
  graph: Graph<Node, Edge>,
  edge: Edge,
): Graph<Node, Edge> => {
  if (graph.edges.has(edge.id)) {
    throw new Error(`Edge already exists: ${String(edge.id)}`);
  }

  assertNodeExists(graph, edge.from);
  assertNodeExists(graph, edge.to);

  const edges = new Map(graph.edges);
  edges.set(edge.id, edge);

  const outgoing = linkEdge(graph.outgoing, edge.from, edge.id);
  const incoming = linkEdge(graph.incoming, edge.to, edge.id);

  return {
    nodes: graph.nodes,
    edges,
    outgoing,
    incoming,
  };
};

export const getNode = <
  Node extends NodeRecord,
  Edge extends EdgeRecord<Node["id"], PropertyKey>,
>(
  graph: Graph<Node, Edge>,
  nodeId: Node["id"],
): Node | undefined => graph.nodes.get(nodeId);

export const getEdge = <
  Node extends NodeRecord,
  Edge extends EdgeRecord<Node["id"], PropertyKey>,
>(
  graph: Graph<Node, Edge>,
  edgeId: Edge["id"],
): Edge | undefined => graph.edges.get(edgeId);

export const getOutgoingEdges = <
  Node extends NodeRecord,
  Edge extends EdgeRecord<Node["id"], PropertyKey>,
>(
  graph: Graph<Node, Edge>,
  nodeId: Node["id"],
): Edge[] =>
  collectEdges(graph, graph.outgoing.get(nodeId));

export const getIncomingEdges = <
  Node extends NodeRecord,
  Edge extends EdgeRecord<Node["id"], PropertyKey>,
>(
  graph: Graph<Node, Edge>,
  nodeId: Node["id"],
): Edge[] =>
  collectEdges(graph, graph.incoming.get(nodeId));

const collectEdges = <
  Node extends NodeRecord,
  Edge extends EdgeRecord<Node["id"], PropertyKey>,
>(
  graph: Graph<Node, Edge>,
  edgeIds: ReadonlySet<Edge["id"]> | undefined,
): Edge[] => {
  if (!edgeIds) {
    return [];
  }

  const edges: Edge[] = [];

  for (const edgeId of edgeIds) {
    const edge = graph.edges.get(edgeId);

    if (edge) {
      edges.push(edge);
    }
  }

  return edges;
};

const assertNodeExists = <
  Node extends NodeRecord,
  Edge extends EdgeRecord<Node["id"], PropertyKey>,
>(
  graph: Graph<Node, Edge>,
  nodeId: Node["id"],
): void => {
  if (!graph.nodes.has(nodeId)) {
    throw new Error(`Unknown node: ${String(nodeId)}`);
  }
};

const ensureAdjacencyEntry = <
  NodeId extends PropertyKey,
  EdgeId extends PropertyKey,
>(
  adjacency: ReadonlyMap<NodeId, ReadonlySet<EdgeId>>,
  nodeId: NodeId,
): ReadonlyMap<NodeId, ReadonlySet<EdgeId>> => {
  if (adjacency.has(nodeId)) {
    return adjacency;
  }

  const next = new Map(adjacency);
  next.set(nodeId, new Set<EdgeId>());
  return next;
};

const linkEdge = <NodeId extends PropertyKey, EdgeId extends PropertyKey>(
  adjacency: ReadonlyMap<NodeId, ReadonlySet<EdgeId>>,
  nodeId: NodeId,
  edgeId: EdgeId,
): ReadonlyMap<NodeId, ReadonlySet<EdgeId>> => {
  const next = new Map(adjacency);
  const current = new Set(next.get(nodeId) ?? []);
  current.add(edgeId);
  next.set(nodeId, current);
  return next;
};
