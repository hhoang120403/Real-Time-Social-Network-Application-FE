import { useState, useEffect } from 'react';
import { collectionService } from '@services/api/collections/collections.service';
import { Utils } from '@services/utils/utils.service';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@redux/store';
import PostComponent from '@components/posts/post/Post';
import { FaBookmark, FaFolder, FaArrowLeft } from 'react-icons/fa';
import './Saved.scss';

const Saved = () => {
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<any>(null);
  const [collectionPosts, setCollectionPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch<AppDispatch>();

  const fetchCollections = async () => {
    try {
      const response = await collectionService.getCollections();
      setCollections(response.data.collections);
      setLoading(false);
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message || 'Error fetching collections', 'error', dispatch);
      setLoading(false);
    }
  };

  const fetchCollectionPosts = async (collectionId: string) => {
    try {
      setLoading(true);
      const response = await collectionService.getCollectionPosts(collectionId);
      setCollectionPosts(response.data.collection.posts);
      setLoading(false);
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message || 'Error fetching posts', 'error', dispatch);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleCollectionClick = (collection: any) => {
    setSelectedCollection(collection);
    fetchCollectionPosts(collection._id);
  };

  const handleBack = () => {
    setSelectedCollection(null);
    setCollectionPosts([]);
  };

  return (
    <div className="saved-page w-full min-h-screen bg-gray-50/30">
      <div className="max-w-[800px] mx-auto py-8 px-4">
        {selectedCollection ? (
          <div className="animate-in fade-in slide-in-from-right duration-300">
             <button onClick={handleBack} className="flex items-center gap-2 text-gray-600 hover:text-black mb-6 transition-colors group">
               <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
               <span className="font-bold uppercase tracking-wider text-sm">Back to Collections</span>
             </button>
             <div className="mb-10">
               <h2 className="text-4xl font-black text-gray-900 italic uppercase tracking-tighter leading-none mb-2">{selectedCollection.name}</h2>
               <div className="flex items-center gap-2">
                  <div className="h-1 w-12 bg-rose-500 rounded-full"></div>
                  <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">{collectionPosts.length} saved posts</p>
               </div>
             </div>
             
             {loading ? (
                <div className="p-8 text-center text-gray-400 font-black italic uppercase">Synchronizing...</div>
             ) : (
                <div className="flex flex-col gap-6">
                  {collectionPosts.length > 0 ? (
                    collectionPosts.map((post) => (
                      <PostComponent key={post._id} post={post} showIcons={false} />
                    ))
                  ) : (
                    <div className="bg-white p-12 rounded-[48px] text-center shadow-xl border border-gray-100/50">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FaBookmark className="text-2xl text-gray-200" />
                      </div>
                      <p className="text-gray-400 font-black uppercase italic">No saved content in this folder</p>
                    </div>
                  )}
                </div>
             )}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom duration-500">
            <div className="flex flex-col gap-2 mb-12">
              <h2 className="text-5xl font-black text-gray-900 italic uppercase tracking-tighter leading-none">Archives</h2>
              <p className="text-gray-500 font-bold text-lg">Your curated space for inspiration and memories</p>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-400 font-black italic uppercase">Loading Archives...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {collections.length > 0 ? (
                  collections.map((collection) => (
                    <div 
                      key={collection._id}
                      onClick={() => handleCollectionClick(collection)}
                      className="group bg-white p-8 rounded-[48px] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer border border-gray-100 flex flex-col gap-6"
                    >
                      <div className="w-full aspect-square rounded-[36px] bg-gray-50 flex items-center justify-center overflow-hidden relative">
                         <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        {collection.posts.length > 0 ? (
                          <img src={`https://picsum.photos/seed/${collection._id}/400`} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                          <FaFolder className="text-5xl text-gray-200" />
                        )}
                        <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                           <span className="text-xs font-black text-gray-900 uppercase tracking-widest">{collection.posts.length} Items</span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-gray-900 group-hover:text-rose-600 transition-colors duration-300 uppercase italic tracking-tight">{collection.name}</h3>
                        <p className="text-gray-400 font-bold text-xs tracking-widest uppercase mt-1">PRIVATE COLLECTION</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full bg-white p-24 rounded-[64px] text-center shadow-2xl border border-gray-100/50 relative overflow-hidden group">
                     <div className="absolute -top-12 -right-12 w-48 h-48 bg-rose-50/50 rounded-full blur-3xl group-hover:bg-rose-100/50 transition-colors duration-500" />
                     
                     <div className="w-24 h-24 bg-linear-to-br from-rose-50 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <FaBookmark className="text-3xl text-rose-500" />
                     </div>
                     <h3 className="text-3xl font-black text-gray-900 uppercase italic tracking-tight mb-4">The Archive is Empty</h3>
                     <p className="text-gray-500 font-medium text-lg max-w-sm mx-auto leading-relaxed">Your future inspirations will live here. Start saving posts to build your personal library.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Saved;
