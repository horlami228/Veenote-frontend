'use client';

import {react, useEffect, useState } from 'react';
import VoiceRecorder from './components/recorder';
import { AuthProvider } from './components/AuthContext';
import SidebarComponent from './components/SideBar';
import TranscriptionEditor from './components/TranscriptionEditor';
import axios from 'axios';
import { notification } from 'antd';
import './globals.css';
import { useRouter } from 'next/navigation';
import { observer } from 'mobx-react';
import { authStore } from './components/AuthStore';
import { useAuth } from './components/AuthContext';

function Page() {
  const [notes, setNotes] = useState([]);
  const [transcriptionText, setTranscriptionText] = useState('');
  const [error, setError] = useState('');
  const [folders, setFolder] = useState([]);
  const [foldersName, setFoldersName] = useState([])
  const [currentNote, setCurrentNote] = useState({ content: '', title: '' });
  const [username, setUsername] = useState('');
  const router = useRouter();

  // const username = authStore.username;
  console.log('username', username);

    useEffect(() => {
      console.log('fetching folders')
      const fetchFolders = async () => {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/folder/getAll`, {
            withCredentials: true,
          });
          console.log('response', response.data.data);
          setFolder(response.data.data);
        } catch (error) {
          console.error('Error fetching folders:', error);
        }
      };
  
      fetchFolders();
    }, []);

  


  const handleTranscriptionSave = (text, filename, selectedFolderId) => {
    setError('');  // Clear any previous errors
    console.log('Saving', { text, filename });
      // Initialize the data object with content
    let data = {
      content: text
    };

    // Add fileName to the data object only if filename is not empty
    if (filename !== '') {
      data.fileName = filename;
    }
    // Implement the saving logic here, e.g., API call or localStorage update
    axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/create/note/${selectedFolderId}/new`, data, {
      withCredentials: true,
    })
    .then((response) => {
      console.log(response);
      notification.success({
        message: 'Save Success',
      })
    })
    .catch((error) => {
      console.error('Error saving transcription:', error);
      if (error.response && error.response.status === 403) {
        notification.error({
          message: 'Save Error',
          description: 'You are not authorized to save transcriptions. Please login.'
        });
        router.push('/login');
      } else if (error.response && error.response.status === 400) {
        if (error.response.data.errorCode === 'DuplicateFileName') {
          setError('Filename already exists. Please choose a different filename.');
        } else if (error.response.data.errorCode === 'MissingContent') {
          setError('Content is missing. Please ensure all required fields are filled.');
        } else {
          // Fallback error message if the specific error is not recognized
          setError('An error occurred. Please check your input and try again.');
        }
      }
      else {
        notification.error({
          message: 'Save Error',
          description: 'Failed to save transcription. Please try again.'
        });
      }
    });
  };

  const handleNoteSelect = (note, e) => {
    e.stopPropagation(); // Stop the click from propagating
    console.log('selecting note', note)
    setCurrentNote({ content: note.content, title: note.fileName });
    console.log(currentNote)
  };

  const handleDeleteNote = (noteId) => {
   // send delete request
    axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/note/delete/${noteId}`, {
      withCredentials: true,
    
    })
      .then(response => {
        notification.success({
          message: 'Delete Success'
        })
      })
      .catch(error => {
        console.error('Error deleting the note:', error);
        notification.error({
          message: 'Delete Error',
          description: 'Failed to delete the note. Please try again.'
        })
      });
  };

  const handleDownload = (noteId) => {
    try {
      const downloadUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/note/download/${noteId}`;
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Error downloading the note:', error);
      notification.error({
        message: 'Download Error',
        description: 'Failed to download the note. Please try again.'
      });
    }
  }

  const handleRenameNote = (noteId, newName) => {
    console.log('renaming note', noteId, newName)
    // send a request to update the note filename
    axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/note/update/${noteId}`, 
    { fileName: newName },
    {withCredentials: true})
      .then(response => {
        // Handle response, if necessary
        notification.success({
          message: 'Rename Success'
        })
      })
      .catch(error => {
        console.error('Error updating note:', error);
        notification.error({
          message: 'Rename Error',
          description: 'Failed to rename the note. Please try again.'
        });
      });
  };

  const handleTranscription = (newTranscription) => {
    setTranscriptionText(newTranscription);
  };

  const handleAddFolder = (newFolder) => {
    setFolder([...folders, newFolder]);
  };
  
  useEffect(() => {
    getUserName();
  }, [])



  const getUserName = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/username`, {
        withCredentials: true,
      });
      setUsername(response.data.userName);
    } catch (error) {
      console.error('Error fetching username:', error);
    }
}

  return (
    <AuthProvider>
      <div className="flex flex-col justify-center min-h-screen bg-gray-600 p-5">
        <VoiceRecorder onTranscriptionComplete={handleTranscription} />
        <div className="w-full max-w-3xl mx-auto mb-5 justify-center">
          <TranscriptionEditor transcriptionText={transcriptionText || currentNote.content}
           fileName={currentNote.title} 
           onSave={handleTranscriptionSave}
           folders={folders}/>
          {error && <div className="text-red-500 text-center">{error}</div>}
        </div>
        <SidebarComponent username={username || 'User'} 
        folders={folders} 
        onNoteSelect={handleNoteSelect} 
        onDelete={handleDeleteNote} 
        onRename={handleRenameNote}
        onAddFolder={handleAddFolder}
        onDownload={handleDownload}/>
        
      </div>
    </AuthProvider>
  );
}

export default observer(Page);
