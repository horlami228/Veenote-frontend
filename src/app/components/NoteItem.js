import React from 'react';
import { Menu, Input, Dropdown } from 'antd';
import { MoreOutlined, EditOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';

const NoteItem = ({ note, 
  onNoteSelect, 
  isRenaming, 
  newName, 
  setNewName, 
  handleRenameConfirm, 
  startRenaming, 
  showDeleteConfirm,
  showDownloadConfirm,
  keepDropdownOpen,
  openDropdownId,
  setIsRenaming }) => (
  
  <Menu.Item key={note.id}>
    <div className="flex justify-between items-center">
      {isRenaming === note.id ? (
        <Input
          value={newName}
          onChange={(e) => {
            e.stopPropagation(); // Prevent event propagation
            setNewName(e.target.value);
          }}
          onPressEnter={() => handleRenameConfirm(note.id)}
          onBlur={() => setIsRenaming(null)}
          autoFocus
        />
      ) : (
        <div
          className="flex-grow cursor-pointer hover:underline"
          onClick={(e) => onNoteSelect(note, e)}
        >
          {note.fileName}
        </div>
      )}
      <Dropdown
        overlay={
          <Menu>
            <Menu.Item key="rename" icon={<EditOutlined />} onClick={(e) => { e.domEvent.stopPropagation(); startRenaming(note, e);}}>
              Rename
            </Menu.Item>
            <Menu.Item key="delete" icon={<DeleteOutlined />} onClick={(e) => {e.domEvent.stopPropagation(); showDeleteConfirm(note.id);}} style={{ color: 'red' }}>
              Delete
            </Menu.Item>
            <Menu.Item key="download" icon={<DownloadOutlined />} onClick={(e) => {e.domEvent.stopPropagation(); showDownloadConfirm(note.id);}}>
              Download
            </Menu.Item>
          </Menu>
        }
        trigger={['click']}
        // onOpenChange={(flag) => keepDropdownOpen(flag, note.id)}
        // open={openDropdownId === note.id && isRenaming !== note.id}
      >
        <MoreOutlined className="cursor-pointer" onClick={(e) => e.stopPropagation()} />
      </Dropdown>
    </div>
  </Menu.Item>
);

export default NoteItem;
