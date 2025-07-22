import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { DataSet, Network } from 'vis-network/standalone/esm/vis-network';

// The component now accepts colorMap and filterType for dynamic control
function GraphView({ data, colorMap, filterType }) {
  const containerRef = useRef(null);

  useEffect(() => {
    // Exit if there is no data or the container isn't ready
    if (!data || !containerRef.current) return;

    // --- Filtering Logic ---
    // 1. Filter nodes based on the filterType prop
    const filteredNodes = filterType && filterType.length > 0
      ? data.nodes.filter(n => filterType.includes(n.type || n.source_type || n.target_type))
      : data.nodes;

    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));

    // 2. Filter edges to only include links between the remaining nodes
    const filteredEdges = data.links.filter(
      e => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)
    );
    
    // --- Data Mapping ---
    const nodes = new DataSet(
      filteredNodes.map(n => {
        const type = n.type || n.source_type || n.target_type || 'Default';
        // Use the colorMap prop for node colors
        const color = colorMap[type] || colorMap.Default;
        return {
          id: n.id,
          label: n.label || n.id,
          ...n,
          font: { face: 'Vazirmatn, Arial', size: 16, color: '#222b45' },
          color: {
            background: color,
            border: '#222b45',
            highlight: {
              background: '#fff',
              border: color,
            },
          },
        };
      })
    );
    const edges = new DataSet(
      filteredEdges.map(e => ({
        from: e.source,
        to: e.target,
        label: e.label || '',
        ...e,
        font: { face: 'Vazirmatn, Arial', size: 14, color: '#888' },
        color: {
          color: '#b2eaff',
          highlight: '#4fcfff',
        },
      }))
    );
    
    // --- Network Initialization ---
    const network = new Network(containerRef.current, { nodes, edges }, {
      nodes: {
        shape: 'dot',
        size: 18,
        borderWidth: 2,
        font: { face: 'Vazirmatn, Arial', size: 16, color: '#222b45' },
      },
      edges: {
        arrows: 'to',
        font: { face: 'Vazirmatn, Arial', size: 14 },
      },
      physics: { stabilization: true },
      layout: { improvedLayout: true },
      interaction: { hover: true },
    });

    // --- Resize Observer ---
    let resizeTimeout = null;
    const resizeObserver = new window.ResizeObserver(() => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (network && containerRef.current) {
          network.fit();
        }
      }, 150);
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // --- Cleanup Function ---
    return () => {
      if (network) {
        network.destroy();
      }
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
    };
    // Update the effect's dependencies
  }, [data, colorMap, filterType]);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        height: '100%', // Use 100% to fill the flex container
        minHeight: 0,
        background: '#fff',
        flex: 1,
      }}
    />
  );
}

export default GraphView;