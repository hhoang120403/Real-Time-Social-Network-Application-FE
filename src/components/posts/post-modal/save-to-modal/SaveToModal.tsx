import { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaLock } from 'react-icons/fa';
import Button from '@components/button/Button';
import { collectionService } from '@services/api/collections/collections.service';
import { Utils } from '@services/utils/utils.service';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@redux/store';
import './SaveToModal.scss';

interface SaveToModalProps {
  postId: string;
  onClose: () => void;
}

const SaveToModal = ({ postId, onClose }: SaveToModalProps) => {
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [showNewCollectionInput, setShowNewCollectionInput] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch<AppDispatch>();

  const fetchCollections = async () => {
    try {
      const response = await collectionService.getCollections();
      setCollections(response.data.collections);

      // Find which collections already have this post
      const selected = response.data.collections
        .filter((c: any) => c.posts.some((pId: string) => pId === postId))
        .map((c: any) => c._id);
      setSelectedCollections(selected);

      setLoading(false);
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message || 'Error fetching collections', 'error', dispatch);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, [postId]);

  const handleToggleCollection = (collectionId: string) => {
    setSelectedCollections((prev) => (prev.includes(collectionId) ? [] : [collectionId]));
  };

  const handleSave = async () => {
    try {
      await collectionService.updatePostCollections({ postId, collectionIds: selectedCollections });
      Utils.dispatchNotification('Collections updated successfully', 'success', dispatch);
      onClose();
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message || 'Error updating collections', 'error', dispatch);
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    try {
      const response = await collectionService.createCollection({ name: newCollectionName, postId });
      setCollections([response.data.collection, ...collections]);
      setSelectedCollections([response.data.collection._id]);
      setNewCollectionName('');
      setShowNewCollectionInput(false);
      Utils.dispatchNotification('Collection created and post saved', 'success', dispatch);
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message || 'Error creating collection', 'error', dispatch);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-[#1c1e21] w-full max-w-[450px] rounded-xl shadow-2xl overflow-hidden border border-[#303338]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#303338]">
          <div className="w-8"></div>
          <h2 className="text-white text-lg font-bold">Save To</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8] transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="p-2 max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-[#b0b3b8]">Loading collections...</div>
          ) : (
            <>
              {collections.map((collection) => (
                <div
                  key={collection._id}
                  onClick={() => handleToggleCollection(collection._id)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#3a3b3c] cursor-pointer transition-colors group select-none"
                >
                  <div className="w-12 h-12 rounded-lg bg-[#3a3b3c] flex items-center justify-center overflow-hidden border border-[#4e4f50]">
                    {collection.posts.length > 0 ? (
                      <div className="w-full h-full bg-[#1877f2] flex items-center justify-center text-white text-xs font-bold">
                        {/* Fallback image or icon */}
                        <img
                          src={`https://picsum.photos/seed/${collection._id}/200`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <FaPlus className="text-[#b0b3b8]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium text-[15px]">{collection.name}</h3>
                    <div className="flex items-center gap-1 text-[#b0b3b8] text-xs">
                      <FaLock className="text-[10px]" />
                      <span>Only me</span>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedCollections.includes(collection._id)
                        ? 'border-[#1877f2] bg-[#1877f2]'
                        : 'border-[#4e4f50]'
                    }`}
                  >
                    {selectedCollections.includes(collection._id) && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                </div>
              ))}

              {!showNewCollectionInput ? (
                <div
                  onClick={() => setShowNewCollectionInput(true)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#3a3b3c] cursor-pointer transition-colors text-white"
                >
                  <div className="w-12 h-12 rounded-lg bg-[#3a3b3c] flex items-center justify-center border border-[#4e4f50]">
                    <FaPlus />
                  </div>
                  <span className="font-medium text-[15px]">New Collection</span>
                </div>
              ) : (
                <div className="p-3">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Collection name"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    className="w-full bg-[#3a3b3c] border border-[#4e4f50] rounded-lg p-3 text-white focus:outline-none focus:border-[#1877f2] mb-3"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateCollection()}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      label="Cancel"
                      className="bg-[#3a3b3c] hover:bg-[#4e4f50] text-white py-1 px-4 rounded-lg"
                      handleClick={() => setShowNewCollectionInput(false)}
                    />
                    <Button
                      label="Create"
                      className="bg-[#1877f2] hover:bg-[#166fe5] text-white py-1 px-4 rounded-lg"
                      handleClick={handleCreateCollection}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#303338] flex justify-end">
          <Button
            label="Done"
            className="bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold py-2 px-8 rounded-lg w-full sm:w-auto transition-all"
            handleClick={handleSave}
          />
        </div>
      </div>
    </div>
  );
};

export default SaveToModal;
