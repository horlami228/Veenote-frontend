'use client';

import React, { useState, useEffect } from 'react';
import { Input, Button, notification, Select } from 'antd';
import { useAuth } from './AuthContext';

const TranscriptionEditor = ({ transcriptionText, fileName, onSave, folders }) => {
  const [text, setText] = useState(transcriptionText || '');
  const [filename, setFilename] = useState(fileName || '');
  const [selectedFolderId, setSelectedFolderId] = useState('');
  const [error, setError] = useState('');
  const { state } = useAuth();
  
  const isSaveDisabled = !text || !text.trim();

  useEffect(() => {
    setText(transcriptionText);
    setFilename(fileName); 
  }, [transcriptionText, fileName]);


  useEffect(() => {
    // Find the root folder and set its ID as the selected value
    const rootFolder = folders.find(folder => folder.isRoot);
    setSelectedFolderId(rootFolder ? rootFolder._id.toString() : null);
  }, [state.isAuthenticated, folders]);


  const handleSave = () => {
    if (!text.trim()) {
      notification.error({
        message: 'Error',
        description: 'Text is empty',
      });
      return; // Exit early if there's an error
    }

  //   if (!filename.trim()) {
  //     notification.error({
  //       message: 'Error',
  //       description: 'Filename is empty',
  //     });
  //     return; // Exit early if there's an error
  // };

  onSave(text, filename, selectedFolderId);
  setText('');
  setFilename('');
  setSelectedFolderId('');
};

  return (
    <div className="p-4">
    <div className="mb-5 mt-10">
      <Input.TextArea
        rows={15}
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{
          fontSize: '16px',
          border: '1px solid #d9d9d9',
          borderRadius: '8px',
          padding: '10px',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
          transition: 'border-color 0.3s, box-shadow 0.3s',
        }}
        placeholder="Enter your transcription here..."
        onFocus={(e) => {
          e.target.style.borderColor = '#40a9ff';
          e.target.style.boxShadow = '0 0 0 2px rgba(24, 144, 255, 0.2)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#d9d9d9';
          e.target.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.1)';
        }}
      />
    </div>
    <div className="mb-5">
      <Input
        placeholder="Enter file name"
        value={filename}
        onChange={(e) => setFilename(e.target.value)}
        className="custom-placeholder"
      />
    </div>
    
    <div className="mb-5 flex justify-between items-center">
      <Button
        onClick={handleSave}
        disabled={isSaveDisabled}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition ease-in-out duration-150"
      >
        Save
      </Button>

      <Select
        placeholder="Select a folder"
        value={selectedFolderId}
        onChange={(setSelectedFolderId)}
        style={{ width: '50%', marginRight: '10px' }}
      >
      {state.isAuthenticated && (
        (folders || []).map(folder => (
          <Select.Option key={folder._id} value={folder._id.toString()}>{folder.folderName}</Select.Option>
        ))
      )}
      </Select>
    </div>
    {console.log('the selected folder id is ', selectedFolderId)}
    {error && <p className="text-red-500 text-center text-xl">{error}</p>}
  </div>
  );
};

export default TranscriptionEditor;
