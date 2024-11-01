import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { ref, get, set, push } from 'firebase/database';
import { Card, TextInput, Button, Table } from 'flowbite-react';

function AppVersionManagement() {
  const [versions, setVersions] = useState([]);
  const [newVersion, setNewVersion] = useState({
    version: '',
    changes: '',
    downloadUrl: '',
    releaseDate: ''
  });

  useEffect(() => {
    fetchVersions();
  }, []);

  const fetchVersions = async () => {
    const versionsRef = ref(db, 'appVersions');
    const snapshot = await get(versionsRef);
    if (snapshot.exists()) {
      const versionsData = Object.entries(snapshot.val())
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
      setVersions(versionsData);
    }
  };

  const transformDropboxUrl = (url) => {
    try {
      const dropboxUrl = new URL(url);
      if (dropboxUrl.hostname === 'www.dropbox.com') {
        // Replace www.dropbox.com with dl.dropboxusercontent.com
        return url.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
      }
      return url;
    } catch (error) {
      console.error('Error transforming URL:', error);
      return url;
    }
  };

  const validateDropboxUrl = (url) => {
    try {
      const dropboxUrl = new URL(url);
      return dropboxUrl.hostname === 'www.dropbox.com' && 
             dropboxUrl.pathname.includes('/scl/fi/') && 
             url.includes('.apk');
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate that it's a Dropbox URL
      if (!validateDropboxUrl(newVersion.downloadUrl)) {
        alert('Please enter a valid Dropbox APK download link');
        return;
      }

      // Transform the URL
      const transformedUrl = transformDropboxUrl(newVersion.downloadUrl);

      // Save to database
      const versionsRef = ref(db, 'appVersions');
      await push(versionsRef, {
        version: newVersion.version,
        changes: newVersion.changes.split('\n'),
        downloadUrl: transformedUrl, // Use the transformed URL
        releaseDate: newVersion.releaseDate || new Date().toISOString(),
        isCurrent: versions.length === 0
      });

      setNewVersion({ version: '', changes: '', downloadUrl: '', releaseDate: '' });
      fetchVersions();
      alert('Version added successfully!');
    } catch (error) {
      console.error('Error adding version:', error);
      alert('Error adding version. Please check the download URL and try again.');
    }
  };

  const setCurrentVersion = async (versionId) => {
    const updates = {};
    versions.forEach(version => {
      updates[`appVersions/${version.id}/isCurrent`] = version.id === versionId;
    });
    await set(ref(db), updates);
    fetchVersions();
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-bold mb-4">Add New Version</h2>
        <div className="mb-4 p-4 bg-blue-50 text-blue-800 rounded-lg">
          <h3 className="font-bold mb-2">Instructions for Dropbox Link:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Upload your APK to Dropbox</li>
            <li>Create a sharing link</li>
            <li>Make sure the link ends with .apk</li>
            <li>Paste the complete Dropbox link below</li>
          </ol>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Version Number
            </label>
            <TextInput
              type="text"
              placeholder="e.g., 1.2.0"
              value={newVersion.version}
              onChange={(e) => setNewVersion({ ...newVersion, version: e.target.value })}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dropbox Download URL
            </label>
            <TextInput
              type="url"
              placeholder="https://www.dropbox.com/scl/fi/.../app-release.apk?..."
              value={newVersion.downloadUrl}
              onChange={(e) => setNewVersion({ ...newVersion, downloadUrl: e.target.value })}
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Paste the complete Dropbox sharing link here
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Release Date
            </label>
            <TextInput
              type="date"
              value={newVersion.releaseDate.split('T')[0]}
              onChange={(e) => setNewVersion({ ...newVersion, releaseDate: new Date(e.target.value).toISOString() })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Changes
            </label>
            <textarea
              className="w-full p-2 border rounded"
              placeholder="List changes (one per line)"
              value={newVersion.changes}
              onChange={(e) => setNewVersion({ ...newVersion, changes: e.target.value })}
              rows={4}
              required
            />
          </div>

          <Button type="submit">
            Add Version
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="text-xl font-bold mb-4">Version History</h2>
        <div className="overflow-x-auto">
          <Table>
            <Table.Head>
              <Table.HeadCell>Version</Table.HeadCell>
              <Table.HeadCell>Release Date</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {versions.map((version) => (
                <Table.Row key={version.id}>
                  <Table.Cell>{version.version}</Table.Cell>
                  <Table.Cell>
                    {new Date(version.releaseDate).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>
                    {version.isCurrent ? (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                        Current
                      </span>
                    ) : (
                      <Button
                        size="xs"
                        onClick={() => setCurrentVersion(version.id)}
                      >
                        Set as Current
                      </Button>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <a
                      href={version.downloadUrl}
                      className="text-primary hover:text-primaryLight mr-2"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download
                    </a>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </Card>
    </div>
  );
}

export default AppVersionManagement;
