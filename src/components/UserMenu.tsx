import { Menu, MenuItems, MenuItem, MenuButton } from '@headlessui/react';
import { DotsThreeVertical, Key, ImageSquare } from 'phosphor-react';

type Props = {
  openChangePasswordModal: (open: boolean) => void;
  openChangeImageModal: (open: boolean) => void;
};

const UserMenu = ({ openChangePasswordModal, openChangeImageModal }: Props) => {
  return (
    <>
      <Menu as="div" className="relative inline-block text-left">
        <MenuButton className="flex items-center justify-center">
          <DotsThreeVertical
            className=""
            aria-hidden="true"
            size={20}
            weight="bold"
          />
        </MenuButton>
        <MenuItems className="z-50 absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white shadow-lg border-1 border-gray-300 ring-opacity-5 focus:outline-none">
          <MenuItem>
            <button
              onClick={() => openChangePasswordModal(true)}
              className="data-active:bg-blue-50 data-active:text-blue-800 text-gray-700
                  w-full px-4 py-3 text-left text-sm flex items-center gap-2 rounded-t-xl"
            >
              <Key size={16} />
              Изменить пароль
            </button>
          </MenuItem>
          <MenuItem>
            <button
              onClick={() => openChangeImageModal(true)}
              className="data-active:bg-blue-50 data-active:text-blue-800 text-gray-700
                  w-full px-5 py-3 text-left text-sm flex items-center gap-2 rounded-b-xl"
            >
              <ImageSquare size={16} />
              Изменить фотографию
            </button>
          </MenuItem>
        </MenuItems>
      </Menu>

      {/* Password Change Modal */}
      {/* {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Change Password
            </h2>
            <div className="mb-4 group">
              <label
                htmlFor="newPassword"
                className="block font-medium mb-1 text-sm text-gray-700 group-focus-within:text-blue-800"
              >
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm"
                placeholder="Enter new password"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordChange}
                disabled={!newPassword}
                className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition disabled:bg-gray-200 disabled:text-gray-500"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )} */}

      {/* Photo Change Modal */}
      {/* {isPhotoModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Change Profile Photo
            </h2>
            <div className="mb-4 group">
              <label
                htmlFor="newPhoto"
                className="block font-medium mb-1 text-sm text-gray-700 group-focus-within:text-blue-800"
              >
                Upload New Photo
              </label>
              <input
                type="file"
                id="newPhoto"
                accept="image/*"
                onChange={(e) =>
                  setNewPhoto(e.target.files ? e.target.files[0] : null)
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsPhotoModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handlePhotoChange}
                disabled={!newPhoto}
                className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition disabled:bg-gray-200 disabled:text-gray-500"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )} */}
    </>
  );
};

export default UserMenu;
