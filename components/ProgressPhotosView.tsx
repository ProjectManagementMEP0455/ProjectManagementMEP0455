import React, { useState, useEffect, FormEvent } from 'react';
import { Project, Profile, UserRole, ProgressPhoto } from '../types';
import Card from './ui/Card';
import { supabase } from '../lib/supabaseClient';
import Button from './ui/Button';
import Input from './ui/Input';

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
            // FIX: Ensure 'photos' state is correctly typed and handles null data.
            setPhotos((data as ProgressPhoto[]) || []);
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

            // FIX: Ensure new photo is correctly typed and checked for null before updating state.
            if (dbData) {
                setPhotos([dbData as ProgressPhoto, ...photos]);
            }
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
        <Card className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">Progress Photos</h3>
            {error && <p className="text-red-400 bg-red-500/20 p-2 rounded-md mb-4">{error}</p>}
            
            {canUpload && (
                 <form onSubmit={handleUpload} className="p-4 bg-secondary/50 rounded-lg mb-6 space-y-3 border border-border">
                    <h4 className="font-semibold">Upload New Photo</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                             <label className="text-sm font-medium">Caption</label>
                             <Input type="text" value={photoCaption} onChange={e => setPhotoCaption(e.target.value)} placeholder="e.g., East wing ductwork installed"/>
                        </div>
                        <div>
                             <label className="text-sm font-medium">Photo Date</label>
                             <Input type="date" value={photoDate} onChange={e => setPhotoDate(e.target.value)} required />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Image File</label>
                        <Input type="file" accept="image/png, image/jpeg, image/gif" onChange={e => setPhotoFile(e.target.files ? e.target.files[0] : null)} required />
                    </div>
                    <Button type="submit" disabled={isUploading} variant="primary" className="w-full" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>}>
                        {isUploading ? "Uploading..." : "Upload Photo"}
                    </Button>
                 </form>
            )}

            {loading ? <p>Loading photos...</p> : (
                <div className="space-y-8">
                    {Object.keys(photosByDate).length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No photos have been uploaded for this project yet.</p>
                    ) : (
                       Object.entries(photosByDate).map(([date, datePhotos]) => (
                           <div key={date}>
                               <h4 className="font-bold text-lg text-foreground pb-2 border-b border-border mb-4">{date}</h4>
                               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                   {/* FIX: Cast datePhotos to ProgressPhoto[] to resolve 'unknown' type error. */}
                                   {(datePhotos as ProgressPhoto[]).map(photo => (
                                       <div key={photo.id} className="cursor-pointer group" onClick={() => setSelectedPhoto(photo)}>
                                           <img src={photo.photo_url} alt={photo.caption || 'Progress Photo'} className="w-full h-32 object-cover rounded-lg shadow-md group-hover:shadow-xl transition-shadow border border-border"/>
                                           <p className="text-xs text-muted-foreground mt-1 truncate">{photo.caption}</p>
                                       </div>
                                   ))}
                               </div>
                           </div>
                       ))
                    )}
                </div>
            )}
            
            {selectedPhoto && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={() => setSelectedPhoto(null)}>
                    <div className="bg-card border border-border rounded-lg p-4 max-w-4xl max-h-[90vh] relative shadow-2xl" onClick={e => e.stopPropagation()}>
                        <Button onClick={() => setSelectedPhoto(null)} variant="ghost" size="sm" className="absolute -top-3 -right-3 bg-background border border-border rounded-full p-1 text-foreground hover:text-destructive z-10 w-8 h-8 flex items-center justify-center" aria-label="Close image viewer">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </Button>
                        <img src={selectedPhoto.photo_url} alt={selectedPhoto.caption || 'Progress Photo'} className="max-w-full max-h-[75vh] object-contain rounded-md"/>
                        <div className="mt-4 text-center">
                            <p className="font-semibold">{selectedPhoto.caption}</p>
                            <p className="text-sm text-muted-foreground">Uploaded by {selectedPhoto.uploader?.full_name} on {new Date(selectedPhoto.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default ProgressPhotosView;