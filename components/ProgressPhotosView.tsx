import React, { useState, useEffect, FormEvent } from 'react';
import { Project, Profile, UserRole, ProgressPhoto } from '../types';
import Card from './ui/Card';
import { supabase } from '../lib/supabaseClient';

interface ProgressPhotosViewProps {
    project: Project;
    userProfile: Profile | null;
}

const ProgressPhotosView: React.FC<ProgressPhotosViewProps> = ({ project, userProfile }) => {
    const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoDate, setPhotoDate] = useState(new Date().toISOString().split('T')[0]);
    const [photoCaption, setPhotoCaption] = useState('');
    const [error, setError] = useState('');
    
    const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);

    const canUpload = userProfile && [
        UserRole.ProjectManager, 
        UserRole.SiteEngineerTechnician, 
        UserRole.EngineerSupervisor, 
        UserRole.AssistantProjectManager,
        UserRole.Admin,
        UserRole.ProjectDirector
    ].includes(userProfile.role);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('progress_photos')
                .select('*, uploader:profiles(full_name)')
                .eq('project_id', project.id)
                .order('photo_date', { ascending: false });
            if (error) throw error;
            setPhotos(data as any[]);
        } catch (err: any) {
            console.error("Error fetching photos:", err);
            setError("Could not load progress photos.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [project.id]);

    const handleUpload = async (e: FormEvent) => {
        e.preventDefault();
        if (!photoFile || !userProfile) {
            setError("Please select a photo to upload.");
            return;
        }

        setIsUploading(true);
        setError('');

        try {
            const fileExt = photoFile.name.split('.').pop();
            const fileName = `${project.id}-${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('progress-photos')
                .upload(fileName, photoFile);
            
            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage.from('progress-photos').getPublicUrl(fileName);

            const { data: dbData, error: dbError } = await supabase
                .from('progress_photos')
                .insert({
                    project_id: project.id,
                    uploaded_by: userProfile.id,
                    photo_url: urlData.publicUrl,
                    caption: photoCaption,
                    photo_date: photoDate
                }).select('*, uploader:profiles(full_name)').single();
            
            if (dbError) throw dbError;

            setPhotos([dbData as any, ...photos]);
            setPhotoFile(null);
            setPhotoCaption('');
            (e.target as HTMLFormElement).reset();

        } catch (err: any) {
            console.error(err);
            setError("Failed to upload photo: " + err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const photosByDate = photos.reduce((acc, photo) => {
        const date = new Date(photo.photo_date).toDateString();
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(photo);
        return acc;
    }, {} as Record<string, ProgressPhoto[]>);

    return (
        <Card>
            <h3 className="text-xl font-semibold text-neutral-darkest mb-4">Progress Photos</h3>
            {error && <p className="text-red-500 bg-red-100 p-2 rounded-md mb-4">{error}</p>}
            
            {canUpload && (
                 <form onSubmit={handleUpload} className="p-4 bg-gray-50 rounded-lg mb-6 space-y-3 border">
                    <h4 className="font-semibold">Upload New Photo</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                             <label className="text-sm font-medium">Caption</label>
                             <input type="text" value={photoCaption} onChange={e => setPhotoCaption(e.target.value)} className="w-full form-input mt-1" placeholder="e.g., East wing ductwork installed"/>
                        </div>
                        <div>
                             <label className="text-sm font-medium">Photo Date</label>
                             <input type="date" value={photoDate} onChange={e => setPhotoDate(e.target.value)} required className="w-full form-input mt-1" />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Image File</label>
                        <input type="file" accept="image/png, image/jpeg, image/gif" onChange={e => setPhotoFile(e.target.files ? e.target.files[0] : null)} required className="w-full text-sm mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-light file:text-brand-primary hover:file:bg-blue-200"/>
                    </div>
                    <button type="submit" disabled={isUploading} className="w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50">
                        {isUploading ? "Uploading..." : "Upload Photo"}
                    </button>
                 </form>
            )}

            {loading ? <p>Loading photos...</p> : (
                <div className="space-y-8">
                    {Object.keys(photosByDate).length === 0 ? (
                        <p className="text-neutral-medium text-center py-8">No photos have been uploaded for this project yet.</p>
                    ) : (
                       Object.entries(photosByDate).map(([date, datePhotos]) => (
                           <div key={date}>
                               <h4 className="font-bold text-lg text-neutral-darkest pb-2 border-b mb-4">{date}</h4>
                               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                   {datePhotos.map(photo => (
                                       <div key={photo.id} className="cursor-pointer group" onClick={() => setSelectedPhoto(photo)}>
                                           <img src={photo.photo_url} alt={photo.caption || 'Progress Photo'} className="w-full h-32 object-cover rounded-lg shadow-md group-hover:shadow-xl transition-shadow"/>
                                           <p className="text-xs text-neutral-medium mt-1 truncate">{photo.caption}</p>
                                       </div>
                                   ))}
                               </div>
                           </div>
                       ))
                    )}
                </div>
            )}
            
            {selectedPhoto && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={() => setSelectedPhoto(null)}>
                    <div className="bg-white rounded-lg p-4 max-w-4xl max-h-[90vh] relative" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedPhoto(null)} className="absolute -top-3 -right-3 bg-white rounded-full p-1 text-gray-800 hover:text-red-600 z-10">&times;</button>
                        <img src={selectedPhoto.photo_url} alt={selectedPhoto.caption || 'Progress Photo'} className="max-w-full max-h-[75vh] object-contain rounded-md"/>
                        <div className="mt-4 text-center">
                            <p className="font-semibold">{selectedPhoto.caption}</p>
                            <p className="text-sm text-neutral-medium">Uploaded by {selectedPhoto.uploader?.full_name} on {new Date(selectedPhoto.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default ProgressPhotosView;
