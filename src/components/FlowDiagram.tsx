'use client';

import { useCallback, useState } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  Connection,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
  OnConnect, // Add this import
  OnConnectStart,
  OnConnectEnd,
  NodeTypes
} from 'reactflow';
import 'reactflow/dist/style.css';

type ContextMenuProps = {
  top: number;
  left: number;
  onClose: () => void;
};

const initialNodes: Node[] = [
  {
    id: 'a',
    type: 'input',
    data: { label: 'Block A' },
    position: { x: 0, y: 0 },
  },
  {
    id: 'b',
    data: { label: 'Block B' },
    position: { x: 0, y: 200 },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'a-b',
    source: 'a',
    target: 'b',
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
];

const ContextMenu = ({ top, left, onClose }: ContextMenuProps) => {
  return (
    <div style={{
      position: 'absolute',
      top: `${top}px`,
      left: `${left}px`,
      zIndex: 10,
      background: 'white',
      border: '1px solid #ddd',
      padding: '10px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
    }}>
      hello world
    </div>
  );
};

const FlowDiagramInner = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [menu, setMenu] = useState<{ top: number; left: number } | null>(null);
  const { project } = useReactFlow();

  const onConnect: OnConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      const pane = event.currentTarget.getBoundingClientRect();
      setMenu({
        top: event.clientY - pane.top,
        left: event.clientX - pane.left,
      });
    },
    [setMenu]
  );

  const onPaneClick = useCallback(() => setMenu(null), [setMenu]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) return;

      const position = project({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `${Date.now()}`,
        type,
        position,
        data: { label: `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [project, setNodes]
  );

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={onPaneClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        fitView
      >
        <Background />
        <Controls />
        {menu && <ContextMenu top={menu.top} left={menu.left} onClose={() => setMenu(null)} />}
      </ReactFlow>

    </div>
  );
};

export function FlowDiagram() {
  return (
    <ReactFlowProvider>
      <FlowDiagramInner />
    </ReactFlowProvider>
  );
}