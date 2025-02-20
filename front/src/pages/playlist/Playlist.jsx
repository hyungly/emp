import React, { useState, useEffect } from 'react';
import '../../styles/Playlist.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import axiosInstance from '../../apis/axiosInstance';
import { userState } from '../../store/atoms';
import SpotifyPlayback from './SpotifyPlayback';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import Message from '../../components/Message';

const Playlist = () => {
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [showSavePopup, setShowSavePopup] = useState(false);
  const [isPlaylistSaved, setIsPlaylistSaved] = useState(false);
  const [untitledCount, setUntitledCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const [currentTrackUri, setCurrentTrackUri] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const location = useLocation();
  const user = useRecoilValue(userState);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (location.state && location.state.playlist) {
          setPlaylist(location.state.playlist);
          setPlaylistName(location.state.playlist.title || '');
        } else {
          const playlistResponse = await axiosInstance.get(`/myplaylist/${user.id}`);
          const playlistData = playlistResponse.data.playlist;
          setPlaylist(playlistData || null);
          setPlaylistName(playlistData?.title || '');
        }
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Error loading playlist');
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    } else {
      setLoading(false);
      setError('User not logged in');
    }
  }, [location.state, user]);

  const handleSongPlay = (track) => {
    if (currentTrackUri === track.spotify_id) {
      setIsPlaying((prev) => !prev);
    } else {
      setCurrentTrackUri(track.spotify_id);
      setIsPlaying(true);
    }
  };

  const handleSavePlaylist = () => {
    setShowSavePopup(true);
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (!playlistId) {
      console.error('삭제할 플레이리스트 ID가 없습니다.');
      return;
    }

    if (window.confirm('정말로 이 플레이리스트를 삭제하시겠습니까?')) {
      try {
        await axiosInstance.delete(`/myplaylist/${playlistId}`);
        alert('플레이리스트가 성공적으로 삭제되었습니다.');
        navigate('/create');
      } catch (err) {
        console.error('플레이리스트 삭제 중 오류:', err);
        alert('플레이리스트 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleSavePlaylistName = async () => {
    setIsSaving(true);
    let title = playlistName.trim() || '제목 없음';

    if (title.startsWith('제목 없음')) {
      setUntitledCount((prevCount) => prevCount + 1);
      title = `제목 없음 ${untitledCount + 1}`;
    }

    const newPlaylistData = {
      title,
      userId: user.id,
      tracks: playlist.tracks,
    };

    try {
      const response = await axiosInstance.post('/save-playlist', newPlaylistData);
      setIsPlaylistSaved(true);
      setPlaylist(response.data);
      setShowSavePopup(false);
      alert('플레이리스트가 성공적으로 저장되었습니다.');
    } catch (err) {
      console.error('플레이리스트 저장 중 오류:', err);
      alert('플레이리스트 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // const handleLatestPlaylist = () => {
  //   if (!isPlaylistSaved) {
  //     alert('플레이리스트를 먼저 저장해주세요.');
  //   } else {
  //     navigate('/mypage');
  //   }
  // };

  const handleNameChange = (e) => {
    setPlaylistName(e.target.value);
  };

  const handleShareClick = () => {
    if (!isPlaylistSaved) {
      alert('플레이리스트를 먼저 저장해주세요.');
    } else {
      setShowShareOptions(!showShareOptions);
    }
  };

  const handlePopupClose = () => {
    setShowSavePopup(false);
  };

  if (loading) return <Message message='loading' />;
  if (error) return <Message message={error.message} />;
  if (!playlist) return <Message message='No playlist found.' />;

  return (
    <div className='playlist-page'>
      <div className='playlist-container'>
        <h1 className='playlist-page-title'>PLAYLIST</h1>
        <h3 className='recommended-playlist-title'>{`${user?.name || user?.display_name}'s`} 추천 플레이리스트</h3>
        <h2 className='playlist-name'>" {playlist.title} "</h2>
        <div className='album-cover-row'>
          {playlist.tracks.map((track, index) => (
            <img
              key={index}
              src={track.albumArt || 'images/emptyalbumart.png'} // 앨범 아트가 없으면 대체 이미지 사용
              alt={track.title}
              className='album-cover'
            />
          ))}
        </div>
        <ul className='song-list'>
          {playlist.tracks.map((track, index) => (
            <li key={index} className='song-item'>
              <span className='artist-title'>
                {track.artist} - {track.title}
              </span>
              <button className='play-button' onClick={() => handleSongPlay(track)}>
                {currentTrackUri === track.spotify_id && isPlaying ? <PauseIcon /> : <PlayIcon />}
              </button>
            </li>
          ))}
        </ul>
        <div className='playlist-buttons'>
          <button className='save-button' onClick={() => handleSavePlaylist()}>
            플레이리스트 저장하기
          </button>
          <button className='delete-button' onClick={() => handleDeletePlaylist(playlist.playlistId)}>
            플레이리스트 삭제하기
          </button>
          <button className='create-button' onClick={() => navigate('/create')}>
            새로운 플레이리스트 생성하기
          </button>
        </div>
        <div className='social-share'>
          <img className='social-share-button' src='/images/share.png' alt='공유하기' onClick={handleShareClick} />
          {showShareOptions && (
            <div className='share-options-popup'>
              <div className='share-titles'>
                <h3 className='share-popup-title'>플레이리스트 공유하기</h3>
                <h2 className='share-playlist-title'>{playlist.title || '제목 없음'}</h2>
              </div>
              <img src='/images/linkshare.png' alt='링크 복사' className='social-share-icon' />
              <img src='/images/kakao.png' alt='카카오톡 공유' className='social-share-icon' />
              <img src='/images/igstory.png' alt='인스타그램 스토리 공유' className='social-share-icon' />
              <img src='/images/igmsg.png' alt='인스타그램 메시지 공유' className='social-share-icon' />
              <img src='/images/whatsapp.png' alt='와츠앱 메시지 공유' className='social-share-icon' />
              <img src='/images/facebook.png' alt='페이스북 공유' className='social-share-icon' />
              <img src='/images/sms.png' alt='SMS 공유' className='social-share-icon' />
            </div>
          )}
        </div>
        {showSavePopup && (
          <div className='save-playlist-popup'>
            <h2 className='save-playlist-title'>
              저장할
              <br /> 플레이리스트의 <br />
              이름을 입력하세요
            </h2>
            <input type='text' value={playlistName} onChange={handleNameChange} placeholder='플레이리스트 이름' className='playlist-name-input' />
            <div className='save-playlist-buttons'>
              <button className='cancel-playlist-button' onClick={handlePopupClose}>
                취소
              </button>
              <button className='save-playlist-button' onClick={handleSavePlaylistName} disabled={isSaving}>
                {isSaving ? '저장 중...' : '저장하기'}
              </button>
            </div>
          </div>
        )}
      </div>

      {currentTrackUri && <SpotifyPlayback trackUri={`spotify:track:${currentTrackUri}`} isPlaying={isPlaying} setIsPlaying={setIsPlaying} />}
    </div>
  );
};

export default Playlist;
