import React, { useEffect, useState, useMemo } from 'react';

import axios from 'axios';

import { AppBar, Toolbar, Typography, Box, Button, List, ListItem, ListItemText, CssBaseline, Divider, IconButton, Tooltip, Stack, TextField } from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';

import RefreshIcon from '@mui/icons-material/Refresh';

import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import Brightness4Icon from '@mui/icons-material/Brightness4';

import Brightness7Icon from '@mui/icons-material/Brightness7';

import SendIcon from '@mui/icons-material/Send';

import { styled } from '@mui/material/styles';

import GraphView from './GraphView';


const sampleConversations = {

  'default': [ { from: 'system', text: 'Select a graph to start a conversation.' } ],

  'social_network.graphml': [ { from: 'user', text: 'Who is the most connected person?' }, { from: 'bot', text: '"Person A" is the most central figure.' } ],

  'corporate_structure.graphml': [ { from: 'user', text: 'Which department is John Doe in?' }, { from: 'bot', text: 'John Doe is in the "Engineering" department.' } ],

  'game_of_thrones.graphml': [ { from: 'user', text: 'Show allies of House Stark.' }, { from: 'bot', text: 'House Stark is allied with House Tully.'} ]

};


const themeColor = 'rgb(79,205,255)';

const bgColor = '#f4f8fb';

const sidebarBg = '#ffffff';

const mainBg = '#f9fbfd';

const borderColor = '#e0e7ef';

const textColor = '#222b45';

const chatBarWidth = 220;


const typeColors = {

  Person: '#4fcfff', Organization: '#ffb347', Location: '#7ed957', Date: '#ff6f91', Event: '#a084e8', Default: '#b2eaff',

};


const Main = styled('main')(() => ({

  flexGrow: 1, padding: 0, background: mainBg, minHeight: '100vh', height: '100vh', color: textColor, display: 'flex', flexDirection: 'column',

}));


function App() {

  const [user, setUser] = useState({ username: '', profile_picture: '' });

  const [files, setFiles] = useState([]);

  const [selectedFile, setSelectedFile] = useState(null);

  const [graphData, setGraphData] = useState(null);

  const [darkMode, setDarkMode] = useState(false);

  const [showHelp, setShowHelp] = useState(false);

  const [legendChecked, setLegendChecked] = useState([]);

  const [legendFilter, setLegendFilter] = useState(null);

  const [sidebarWidth, setSidebarWidth] = useState(320);

  const [isResizing, setIsResizing] = useState(false);

  const [chatMessages, setChatMessages] = useState(sampleConversations.default);

  const [fileListFlex, setFileListFlex] = useState(1);

  const [isResizingHeight, setIsResizingHeight] = useState(false);


  useEffect(() => {

    if (selectedFile && sampleConversations[selectedFile]) {

      setChatMessages(sampleConversations[selectedFile]);

    } else if (selectedFile) {

      setChatMessages([ { from: 'system', text: `This is the chat for ${selectedFile}. Ask a question.` } ]);

    } else {

      setChatMessages(sampleConversations.default);

    }

  }, [selectedFile]);


  useEffect(() => {

    axios.get('/api/user').then(res => setUser(res.data));

    fetchFiles();

  }, []);


  const typeColorMap = useMemo(() => {

    if (!graphData?.nodes) return typeColors;

    const palette = [ '#4fcfff', '#ffb347', '#7ed957', '#ff6f91', '#a084e8', '#f9a602', '#e57373', '#64b5f6', '#81c784', '#ba68c8', '#ffd54f', '#90a4ae', '#f06292', '#9575cd', '#4db6ac', '#dce775', '#ffd740', '#bdbdbd', '#ff8a65', '#a1887f' ];

    const types = Array.from(new Set(graphData.nodes.map(n => n.type || n.source_type || n.target_type || 'Default'))).sort();

    const newMap = {};

    types.forEach((type, i) => { newMap[type] = palette[i % palette.length]; });

    return newMap;

  }, [graphData]);

 

  // Effect for vertical resizing (sidebar width)

  useEffect(() => {

    const handleMouseMove = (e) => {

      if (!isResizing) return;

      const newWidth = e.clientX;

      if (newWidth >= 280 && newWidth <= 600) setSidebarWidth(newWidth);

    };

    const handleMouseUp = () => { setIsResizing(false); };

    if (isResizing) {

      window.addEventListener('mousemove', handleMouseMove);

      window.addEventListener('mouseup', handleMouseUp, { once: true });

    }

    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };

  }, [isResizing]);


  // Effect for horizontal resizing (component height)

  useEffect(() => {

    const handleMouseMoveHeight = (e) => {

        if (!isResizingHeight) return;

        const newFlex = fileListFlex + (e.movementY / 300);

        if (newFlex > 0.5 && newFlex < 5) {

            setFileListFlex(newFlex);

        }

    };

    const handleMouseUpHeight = () => { setIsResizingHeight(false); };


    if (isResizingHeight) {

        window.addEventListener('mousemove', handleMouseMoveHeight);

        window.addEventListener('mouseup', handleMouseUpHeight, { once: true });

    }

    return () => { window.removeEventListener('mousemove', handleMouseMoveHeight); window.removeEventListener('mouseup', handleMouseUpHeight); };

  }, [isResizingHeight, fileListFlex]);



  const fetchFiles = () => axios.get('/api/graphml').then(res => setFiles(res.data.files));

  const handleFileUpload = (e) => { const file = e.target.files[0]; if (!file) return; const formData = new FormData(); formData.append('file', file); axios.post('/api/graphml', formData).then(() => fetchFiles()); };

  const handleFileSelect = (filename) => { setSelectedFile(filename); setLegendFilter(null); setLegendChecked([]); axios.get(`/api/graphml/${filename}`).then(res => setGraphData(res.data)); };

  const handleDeleteFile = (filename) => { if (window.confirm(`Delete ${filename}?`)) { axios.delete(`/api/graphml/${filename}`).then(() => { fetchFiles(); if (selectedFile === filename) { setSelectedFile(null); setGraphData(null); } }); } };

  const handleRefresh = () => { fetchFiles(); setGraphData(null); setSelectedFile(null); };

  const handleToggleDarkMode = () => { setDarkMode((prev) => !prev); document.body.style.background = darkMode ? bgColor : '#23272f'; document.body.style.color = darkMode ? textColor : '#e0e7ef'; };


  return (

    <Box sx={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', direction: 'ltr' }}>

      <CssBaseline />

      <AppBar position="fixed" sx={{ background: '#fff', color: themeColor, boxShadow: '0 2px 8px #e0e7ef55', zIndex: 1201 }}>

        <Toolbar>

          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, color: themeColor, letterSpacing: 2 }}>KRAGER</Typography>

          <Tooltip title="Refresh file list"><IconButton onClick={handleRefresh} sx={{ color: themeColor }}><RefreshIcon /></IconButton></Tooltip>

          <Tooltip title={darkMode ? 'Light mode' : 'Dark mode'}><IconButton onClick={handleToggleDarkMode} sx={{ color: themeColor }}>{darkMode ? <Brightness7Icon /> : <Brightness4Icon />}</IconButton></Tooltip>

          <Tooltip title="Help"><IconButton onClick={() => setShowHelp(true)} sx={{ color: themeColor }}><HelpOutlineIcon /></IconButton></Tooltip>

          <Typography variant="body1" sx={{ marginRight: 2, color: textColor, fontWeight: 700, fontFamily: 'Vazirmatn, Arial' }}>{user.username}</Typography>

        </Toolbar>

      </AppBar>


      <Box sx={{ display: 'flex', flexDirection: 'row', height: '100vh', zIndex: 1201 }}>

       

        <Box sx={{ width: sidebarWidth, background: sidebarBg, borderLeft: `1px solid ${borderColor}`, boxShadow: '0 0 16px #e0e7ef33', height: '100vh', display: 'flex', flexDirection: 'column' }}>

          <Toolbar />

          <Box sx={{ p: 2, flex: fileListFlex, overflowY: 'auto', minHeight: '100px' }}>

            <Typography variant="h6" sx={{ color: themeColor, fontWeight: 700, mb: 1 }}>GraphML Files <Typography component="span" variant="caption" sx={{ color: textColor, fontWeight: 500, ml: 1 }}>({files.length})</Typography></Typography>

            <Button variant="contained" component="label" sx={{ mt: 2, background: themeColor, color: '#fff', fontWeight: 600, boxShadow: '0 2px 8px #4fcfff33', borderRadius: 2, '&:hover': { background: '#3bbbe0' } }}>Browse<input type="file" accept=".graphml" hidden onChange={handleFileUpload} /></Button>

            <Divider sx={{ my: 2, borderColor: borderColor }} />

            <List sx={{ width: '100%' }}>

              {files.map(f => (

                <ListItem key={f} selected={selectedFile === f} sx={{ borderRadius: 3, mb: 1.5, background: selectedFile === f ? '#e6f7ff' : '#fff', boxShadow: selectedFile === f ? '0 2px 8px #4fcfff22' : '0 1px 4px #e0e7ef22', '&:hover': { background: '#f0faff', boxShadow: '0 2px 8px #4fcfff33' }, display: 'flex', alignItems: 'center', px: 2, py: 1.5, transition: 'all 0.15s', border: selectedFile === f ? `2px solid ${themeColor}` : `1px solid ${borderColor}`, color: selectedFile === f ? themeColor : textColor, cursor: 'pointer', }} secondaryAction={<IconButton edge="end" aria-label="delete" onClick={() => handleDeleteFile(f)} sx={{ color: '#ff6f91', ml: 1 }}><DeleteIcon /></IconButton>} button onClick={() => handleFileSelect(f)}>

                  <Tooltip title={f} placement="right" arrow><ListItemText primary={f.length > 28 ? f.slice(0, 12) + '...' + f.slice(-12) : f} sx={{ color: selectedFile === f ? themeColor : textColor, fontWeight: 700, fontFamily: 'Vazirmatn, Arial', fontSize: '1.08rem', letterSpacing: 0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}/></Tooltip>

                </ListItem>

              ))}

            </List>

          </Box>

         

          <Box onMouseDown={() => setIsResizingHeight(true)} sx={{ height: '5px', width: '100%', cursor: 'row-resize', backgroundColor: isResizingHeight ? themeColor : 'transparent', '&:hover': { backgroundColor: themeColor, opacity: 0.5 }, transition: 'background-color 0.2s' }} />


          <Box sx={{ p: 2, borderTop: `1px solid ${borderColor}`, display: 'flex', flexDirection: 'column', flex: 1, minHeight: '200px' }}>

            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: themeColor, mb: 1, fontFamily: 'Vazirmatn, Arial', fontSize: '1.1rem', letterSpacing: 0.5 }}>Legend</Typography>

            <Box sx={{ flex: 1, overflowY: 'auto', my: 1 }}>

              <Stack spacing={1} sx={{ width: '100%' }}>

                {graphData && Object.entries(typeColorMap).filter(([type]) => type !== 'Default').map(([type, color]) => (

                  <Box key={type} sx={{ display: 'flex', alignItems: 'center' }}>

                    <input type="checkbox" checked={legendChecked.includes(type)} onChange={e => { setLegendChecked(checked => e.target.checked ? [...checked, type] : checked.filter(t => t !== type)); }} style={{ marginRight: 8, accentColor: color, width: 16, height: 16 }} id={`legend-check-${type}`}/>

                    <label htmlFor={`legend-check-${type}`} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', width: '100%' }}>

                      <Box sx={{ width: 18, height: 18, borderRadius: '50%', background: color, border: '2px solid #222b45', mr: 1, flexShrink: 0 }} />

                      <Typography noWrap variant="caption" sx={{ color: textColor, fontFamily: 'Vazirmatn, Arial', fontWeight: 600, fontSize: '0.98rem' }}>{type}</Typography>

                    </label>

                  </Box>

                ))}

              </Stack>

            </Box>

            {graphData && (

              <Box sx={{mt: 'auto'}}>

                <Button fullWidth variant="contained" sx={{ mb: 1, background: themeColor, color: '#fff', fontWeight: 700, borderRadius: 2, fontFamily: 'Vazirmatn, Arial', fontSize: '0.98rem' }} onClick={() => setLegendFilter(legendChecked.length > 0 ? [...legendChecked] : null)}>Filter</Button>

                {legendFilter?.length > 0 && <Button fullWidth variant="text" sx={{ color: '#ff6f91', fontWeight: 600, fontFamily: 'Vazirmatn, Arial', fontSize: '0.95rem' }} onClick={() => { setLegendFilter(null); setLegendChecked([]); }}>Clear Filter</Button>}

              </Box>

            )}

          </Box>

        </Box>

       

        <Box onMouseDown={() => setIsResizing(true)} sx={{ width: '5px', height: '100vh', cursor: 'col-resize', backgroundColor: isResizing ? themeColor : 'transparent', '&:hover': { backgroundColor: themeColor, opacity: 0.5, }, transition: 'background-color 0.2s', }} />


        <Box sx={{ width: chatBarWidth, background: sidebarBg, borderLeft: `1px solid ${borderColor}`, p: 2, display: 'flex', flexDirection: 'column', height: '100vh' }}>

            <Toolbar />

            <Typography variant="h6" sx={{ color: themeColor, fontWeight: 700, fontFamily: 'Vazirmatn, Arial', mb: 2 }}>Chat</Typography>

            <Box sx={{ flexGrow: 1, overflowY: 'auto', background: '#f9fbfd', borderRadius: 2, p: 1.5, mb: 2 }}>

                <Stack spacing={2}>

                    {chatMessages.map((msg, index) => ( <Box key={index} sx={{ alignSelf: msg.from === 'bot' || msg.from === 'system' ? 'flex-start' : 'flex-end', textAlign: msg.from === 'bot' || msg.from === 'system' ? 'left' : 'right', }}> <Typography variant="body2" sx={{ display: 'inline-block', background: msg.from === 'bot' ? '#e2e8f0' : msg.from === 'system' ? 'transparent' : themeColor, color: msg.from === 'bot' ? textColor : msg.from === 'system' ? '#a0aec0' : '#fff', p: 1, borderRadius: 2, fontStyle: msg.from === 'system' ? 'italic' : 'normal', fontFamily: 'Vazirmatn, Arial' }}> {msg.text} </Typography> </Box> ))}

                </Stack>

            </Box>

            <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>

                <TextField fullWidth variant="outlined" size="small" disabled placeholder="چیزی بپرسید..." sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', background: '#f4f8fb', fontFamily: 'Vazirmatn, Arial', }, '& .Mui-disabled': { color: '#c0c0c0' } }}/>

                <IconButton color="primary" disabled><SendIcon /></IconButton>

            </Box>

        </Box>

      </Box>


      <Main sx={{ ml: 0, width: `calc(100vw - ${sidebarWidth + chatBarWidth + 5}px)`, height: '100vh', minHeight: 0, overflow: 'hidden' }}>

        <Toolbar />

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: 'calc(100% - 64px)' }}>

          {graphData ? (

            // --- THIS IS THE FIX ---

            // The two components below are now wrapped in a single React Fragment <>...</>

            <>

              <Box sx={{ width: '100%', background: '#f4f8fb', borderBottom: `1px solid ${borderColor}`, p: 1.2, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontFamily: 'Vazirmatn, Arial', fontSize: '1rem', color: textColor, fontWeight: 600 }}>Nodes: {graphData.nodes.length} &nbsp; | &nbsp; Edges: {graphData.links.length}</Box>

              <GraphView key={JSON.stringify(legendFilter) + (graphData ? graphData.nodes.length + '-' + graphData.links.length : '')} data={graphData} filterType={legendFilter} colorMap={typeColorMap}/>

            </>

          ) : (

            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography variant="h5" sx={{ color: borderColor, fontWeight: 500 }}>Please select a GraphML file</Typography></Box>

          )}

        </Box>

        {showHelp && (

          <Box sx={{ position: 'fixed', top: 80, right: 40, zIndex: 2000, background: '#fff', color: textColor, p: 3, borderRadius: 2, boxShadow: 4, minWidth: 320 }}>

            <Typography variant="h6" sx={{ mb: 1, color: themeColor }}>Help</Typography>

            <Typography variant="body1" sx={{ mb: 2 }}>

              • Click 'Browse' to upload a GraphML file.<br />

              • After uploading, click on a file name to display the graph.<br />

              • To refresh the file list, click the <RefreshIcon fontSize="small" sx={{ verticalAlign: 'middle' }} /> icon.<br />

              • To toggle dark/light mode, click the <Brightness4Icon fontSize="small" sx={{ verticalAlign: 'middle' }} /> icon.<br />

            </Typography>

            <Button variant="contained" sx={{ background: themeColor }} onClick={() => setShowHelp(false)}>Close</Button>

          </Box>

        )}

      </Main>

    </Box>

  );

}


export default App; 