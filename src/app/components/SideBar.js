import {
  UserOutlined, FolderOpenOutlined, DownOutlined, RightOutlined,
  LeftOutlined, SettingOutlined, SearchOutlined, MenuOutlined, CloseOutlined,
} from '@ant-design/icons';
import { MoreOutlined, EditOutlined, DeleteOutlined, FolderAddOutlined } from '@ant-design/icons';
import { Menu, Dropdown, Input, Modal, notification, Button } from 'antd';
import { useState, useEffect } from 'react';
import axios from 'axios';
import NoteItem from './NoteItem';
import UserProfileModal from './userProfileModal';
import {useAuth} from './AuthContext';


// Sidebar component
const SidebarComponent = ({ username, folders, onNoteSelect, onDelete, onRename, onAddFolder, onDownload }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileSidebarVisible, setIsMobileSidebarVisible] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(null);  // To track which note is being renamed
  const [newName, setNewName] = useState('');  // To hold the new name being entered
  const [folderNotes, setFolderNotes] = useState({});
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [error, setError] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [isUserSettingsModalVisible, setIsUserSettingsModalVisible] = useState(false);
  const {state} = useAuth()



  useEffect(() => {
    // Define a function to update the state based on the window's width
    const updateScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 768);
    };

    // Update the screen size upon initial component mount
    updateScreenSize();

    // Add an event listener for subsequent window resize events
    window.addEventListener('resize', updateScreenSize);

    // Cleanup the event listener when the component unmounts
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  const handleOpenChange = async (flag, folderId) => {
    console.log('Folder ID:', folderId);
    // Expand or collapse the dropdown
    setDropdownOpen(flag ? folderId : null);
  
    // Fetch notes every time the folder is opened
    if (flag) {
      console.log('Fetching notes for folder:', folderId);
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/folder/notes/${folderId}`, {
          withCredentials: true,
        });
  
        // Ensure that response.data and response.data.folder exist before accessing notes
        if (response.data && response.data.folder && Array.isArray(response.data.folder.notes)) {
          console.log('Available notes');
          setFolderNotes({
            ...folderNotes,
            [folderId]: response.data.folder.notes // Safely assign notes to the state
          });
        } else {
          // Handle the case where no notes are present or the structure is not as expected
          console.log('No notes found or unexpected data structure');
          setFolderNotes({
            ...folderNotes,
            [folderId]: [] // Assign an empty array if no notes are present
          });
        }
        
      } catch (error) {
        console.error('Failed to fetch notes:', error);
        notification.error({
          message: 'Error',
          description: 'Failed to fetch notes. Please try again.'
        });
      }
    }
  };
  
  

  const toggleMobileSidebar = () => {
    setIsMobileSidebarVisible(!isMobileSidebarVisible);
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const showUserSettingsModal = () => {
    setIsUserSettingsModalVisible(true);
  };
  
  const hideUserSettingsModal = () => {
    setIsUserSettingsModalVisible(false);
  };
  
  
  const showDeleteConfirm = (noteId) => {
    console.log('noteId in showDeleteConfirm:', noteId); // Check the received noteId

    Modal.confirm({
      title: 'Are you sure you want to delete this note?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        onDelete(noteId);
      },
    });
  };

  const showDownloadConfirm = (noteId) => {
    console.log('noteId in showDownloadConfirm:', noteId); // Check the received noteId

    Modal.confirm({
      title: 'Are you sure you want to download this note?',
      okText: 'Yes',
      okType: 'primary',
      okButtonProps: { style: { color: 'black', backgroundColor: '#f0f0f0' } },
      cancelText: 'No',
      onOk() {
        onDownload(noteId);
      },
    });
  }

  const startRenaming = (note) => {
    console.log('note in startRenaming:', note);  // Check the note object
    setIsRenaming(note.id);
    setNewName(note.fileName);
  };
  
  
  const handleRenameConfirm = (noteId) => {
    if (newName.trim() !== '') {
      // Pass the new name up to the parent component
      onRename(noteId, newName);
      setIsRenaming(null);
      setNewName('');
    }
  };

  const handleCreateFolder = async () => {
    if (newFolderName.trim() != '') {
      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/folder/create/new`, { folderName: newFolderName }, { withCredentials: true });
        const createdFolder = response.data;
        // setFolder([...folders, createdFolder]);  // Update the folders state
        onAddFolder(createdFolder);  // Pass the new folder up to the parent component
        setNewFolderName('');  // Reset the input field
        setIsCreatingFolder(false);  // Hide the input field
        notification.success({
          message: 'Success',
          description: 'Folder created successfully.'
        });
      } catch (error) {
        if (error.response && error.response.status === 409) {
          console.error('Folder already exists:', error);
          notification.error({
            message: 'Error',
            description: 'A folder with the same name already exists.'
          });
        }
        else {
          console.error('Error creating folder:', error);
          // work on the error
          setError()
          setIsCreatingFolder(false)
          setNewFolderName('')
          notification.error({
            message: 'Error',
            description: 'Failed to create the folder. Please try again.'
          });
        }

      }
    } else if (newFolderName.trim() === '') {
      notification.error({
        message: 'Error',
        description: 'Folder name cannot be empty.'
      });
    }
      // Whether a folder was created or not, hide the input field
      setIsCreatingFolder(false);
  };
  
  const keepDropdownOpen = (isOpen, noteId) => {
    if (isOpen) {
      // Open the dropdown and set its ID as the openDropdownId
      setOpenDropdownId(noteId);
    } else if (!isOpen && openDropdownId === noteId) {
      // If trying to close the same dropdown that's currently open, decide based on conditions

      setTimeout(() => {
        // Ensure that after the timeout, the intended dropdown is still the one to be closed.
        if (openDropdownId === noteId) {
          setOpenDropdownId(null);
        }
      }, 500);
    }
  };

  
  
    // Dropdown menu for user settings
    const userMenu = (
      <Menu>
        <Menu.Item key="0" onClick={showUserSettingsModal}>
          <SettingOutlined style={{ marginRight: 8 }} />
          Profile Settings
        </Menu.Item>
        {/* More menu items can be added here */}
        <Menu.Item key="1">
          <SettingOutlined style={{ marginRight: 8 }} />
          Logout
        </Menu.Item>
      </Menu>
    );  

  return (
    <>
   
    {state.isAuthenticated && (
      <div>
      {/* User profile settings modal */}
      <UserProfileModal isVisible={isUserSettingsModalVisible} onClose={hideUserSettingsModal} />

      {/* Hamburger icon for mobile screens */}
      {!isLargeScreen && !isMobileSidebarVisible && (
        <div className="fixed top-0 left-0 p-4 z-20">
          <MenuOutlined onClick={toggleMobileSidebar} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 z-10 bg-gray-300 transition-all duration-300 h-full ${
        isLargeScreen ? (collapsed ? 'w-16' : 'w-64') : (isMobileSidebarVisible ? 'w-64' : 'w-0')
      }`}>
        {!isLargeScreen && isMobileSidebarVisible && (
          <div className="absolute top-0 right-0 p-4">
            <CloseOutlined onClick={toggleMobileSidebar} />
          </div>
        )}
        <div className="flex flex-col justify-between h-full">
          <div className="p-4 flex flex-col items-center">
            {((isLargeScreen && !collapsed) || (!isLargeScreen && isMobileSidebarVisible)) && (
              <>
                <Dropdown overlay={userMenu} placement="bottomLeft" trigger={['click']}>
                  <div className="p-4 cursor-pointer">
                    <div className="w-16 h-16 rounded-full bg-gray-400 flex items-center justify-center">
                      <UserOutlined className="text-white text-3xl" />
                    </div>
                  </div>
                </Dropdown>
                <div className="px-4 flex flex-col items-center">
                  <span className="text-2xl font-medium mt-2">{username}</span>
                  <Input prefix={<SearchOutlined />} className="my-4" placeholder="Search notes" />

            {/* Folder creation area */}
            <div className="folder-creation-area">
          {isCreatingFolder ? (
            <Input
              type="text"
              placeholder="Enter folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onPressEnter={handleCreateFolder}
              onBlur={() => setIsCreatingFolder(false)}
              autoFocus
            />
          ) : (
            <Button icon={<FolderAddOutlined />} onClick={() => setIsCreatingFolder(true)}>Add Folder</Button>
          )}
        </div>
        {/**Existing folder */}
        {
          Array.isArray(folders) && folders.map((folder) => (
            <Dropdown
              key={folder._id}
              overlay={
                <Menu>
                  {
                    (folderNotes[folder._id] && folderNotes[folder._id].length > 0) ?
                    folderNotes[folder._id].map((note) => (
                              <NoteItem
                                key={note.id}
                                note={note}
                                onNoteSelect={onNoteSelect}
                                isRenaming={isRenaming}
                                newName={newName}
                                setNewName={setNewName}
                                handleRenameConfirm={handleRenameConfirm}
                                startRenaming={startRenaming}
                                showDeleteConfirm={showDeleteConfirm}
                                showDownloadConfirm={showDownloadConfirm}
                                keepDropdownOpen={(isOpen) => keepDropdownOpen(isOpen, note.id)}
                                openDropdownId={openDropdownId}
                                setIsRenaming={setIsRenaming}
                            />
                    )) :
                    <Menu.Item disabled>No notes available</Menu.Item> // Display when no notes are available
                  }
                </Menu>
              }
              onOpenChange={(flag) => handleOpenChange(flag, folder._id)}
              open={dropdownOpen === folder._id}
              trigger={['click']}
              className="mb-2" // Adding bottom margin to each Dropdown
            >
              <a className="ant-dropdown-link cursor-pointer flex items-center justify-between text-lg p-2" // Adding padding for better spacing
                style={{ display: 'block', marginBottom: '10px' }}>
                <FolderOpenOutlined className="mr-2" /> {folder.folderName} {dropdownOpen === folder._id ? <DownOutlined /> : <RightOutlined />}
              </a>
            </Dropdown>
          ))
        }

              </div>
              </>
            )}
          </div>
          {isLargeScreen && (
            <div className="p-4">
              <button onClick={toggleSidebar} className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-300">
                {collapsed ? <RightOutlined /> : <LeftOutlined />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
      )}
   </>
  );
};

export default SidebarComponent;
