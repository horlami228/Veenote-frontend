'use client';

import { useRef, useState, useEffect} from 'react';
import { MicrophoneIcon, StopIcon } from '@heroicons/react/24/outline';
import { notification, Spin } from 'antd';
import Link from 'next/link';
import { useAuth } from './AuthContext';
import axios from 'axios';
import LogoutButton from './LogoutComponent';
import {useRouter} from 'next/navigation';

function VoiceRecorder({onTranscriptionComplete}) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState([]);
  const mediaRecorderRef = useRef(null);
  const intervalRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const audioChunksRef = useRef([]); // Use a ref to persist audio chunks
  const websocketRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { state } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // Cleanup function to close WebSocket connection when component unmounts
    return () => {
      if (websocketRef.current) {
        console.log('Closing WebSocket connection...');
        websocketRef.current.close();
      }
    };
  }, []);

  const handleDataAvailable = (event) => {
    console.log('Data available from recording...');
    if (event.data.size > 0) {
      console.log(`Data size: ${event.data.size}`);
      if (event.data.size > 0 && websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
        websocketRef.current.send(event.data);
    }
    } else {
      console.log('Data chunk size is 0.');
    }
  };

  
  const startRecording = () => {
    if (!isRecording) {
        console.log('Starting recording...');
        const constraints = {
            audio: {
                noiseSuppression: true, // Enable noise suppression
                echoCancellation: true, // Enable echo cancellation
                echoCancellationType: 'browser' // Use browser echo cancellation
            }
        };

        // establish websocket connection
        websocketRef.current = new WebSocket(`${process.env.NEXT_PUBLIC_WS_BASE_URL}`);
        if (websocketRef.current) {
          console.log('WebSocket connection established.');
        } else {
          console.error('WebSocket connection failed.');
          notifcation.error({
            message: 'WebSocket error',
            description: 'An error occurred with the Websocket connection'
          });
          stopRecording();
        };

        websocketRef.current.onopen = () => {
          console.log('WebSocket connection established.');
      };

      websocketRef.current.onmessage = (event) => {
        console.log('WebSocket message received:', event.data);
    
        const data = JSON.parse(event.data);
        if (data.type === 'finalTranscript') {
          console.log('Final transcript:', data.message);
          onTranscriptionComplete(data.message);
        }
        websocketRef.current.close();
        setIsLoading(false);
    };
    
      websocketRef.current.onclose = () => {
        console.log('WebSocket connection closed.');
    };

      websocketRef.current.onerror = (error) => {
          console.error('WebSocket error:', error);
          notification.error({
              message: 'WebSocket Error',
              description: 'An error occurred with the WebSocket connection.'
          });
      };
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) => {

          // Check if the browser supports the desired audio MIME type
            const options = { mimeType: 'audio/webm;codecs=opus' }; // Opus is widely supported and good for voice
            if (MediaRecorder.isTypeSupported('audio/wav')) {
              options.mimeType = 'audio/wav';
            }
            mediaRecorderRef.current = new MediaRecorder(stream, options);
            mediaRecorderRef.current.ondataavailable = handleDataAvailable;
            mediaRecorderRef.current.onstop = () => {
              // setIsLoading(true);
              console.log('Recording stopped.');
            }

            mediaRecorderRef.current.start(100); // Start recording with a time slice of 1 second
            setIsRecording(true);
            console.log('MediaRecorder started with MIME type:', options.mimeType);
            setDuration(0);
            setError('');  // Clear any previous errors
            // setAudioChunks([]);
            intervalRef.current = setInterval(() => setDuration((prevDuration) => prevDuration + 1), 1000);
        }).catch((error) => {
            console.error('Error accessing the microphone:', error);
            setError('Error accessing the microphone.');
            notification.error({
              message: 'Recording Error',
              description: 'There was an error accessing the microphone. Please try again.'
            });
        });
      } else {
        console.error('getUserMedia not supported.');
        setError('getUserMedia not supported.');
        notification.error({
          message: 'Recording Error',
          description: 'Your browser does not support recording audio. Please try a different browser.'
        });
      }

    }
};

  const stopRecording = () => {
    if (isRecording && mediaRecorderRef.current) {
      console.log('Stopping recording...');
      mediaRecorderRef.current.stop();
      clearInterval(intervalRef.current);
      setIsRecording(false);
      setDuration(0);
      setIsLoading(true);
      setTimeout(() => {
      // Send a message to the server indicating the end of the audio stream
      if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      websocketRef.current.send(JSON.stringify({ type: 'endOfAudio' }));
      }
    }, 3000); 

  }
};

  const formatDuration = (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div>
      {!state.isAuthenticated && (
      <div className="absolute top-5 right-5">
        <Link href="/login" className="text-blue-500 bg-white hover:bg-blue-100 font-bold py-2 px-4 rounded mr-2 shadow">Login</Link>
        <Link href="/register" className="text-green-500 bg-white hover:bg-blue-100 font-bold py-2 px-4 rounded shadow">Signup</Link>
      </div>
      )}

      {state.isAuthenticated && (
      <div className="absolute top-5 right-5">
        <LogoutButton />
      </div>
      )}

      {console.log('State:', state)}
      {error && <div className="text-red-500 text-center">{error}</div>}
     
        
      <div className="text-center mt-20 ">
      <>
          {isLoading && <Spin spinning={isLoading} size="large" />}
        <p className="text-2xl mb-4 text-white">{formatDuration(duration)}</p>
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`inline-block p-2 rounded-full ${isRecording ? 'bg-red-500' : 'bg-blue-500'} text-white`}
        >
          {isRecording ? <StopIcon className="h-10 w-10" /> : <MicrophoneIcon className="h-10 w-10" />}
        </button>
      </>
      </div>
      
    </div>
  );
  
}

export default VoiceRecorder;
