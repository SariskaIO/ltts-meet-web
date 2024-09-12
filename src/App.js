import { useEffect } from 'react';
import './App.css';
import { getVideoCards } from './utils';
import Home from './views/Home';
import { listMediaTrackUrls } from './store/actions/media';
import { useDispatch } from 'react-redux';
import { Route, Switch } from 'react-router-dom/cjs/react-router-dom.min';
import Meeting from './views/Meeting';
//import Meet from './views/Meet';

function App() {

  const dispatch = useDispatch();

  useEffect(() => {
    async function fetchData() {
      const videosData = await getVideoCards();
      if (videosData && videosData.length > 0) {
        videosData?.forEach(video => (
            video.url ? dispatch(listMediaTrackUrls(video.url)) : video
        ))
      }
    }
    fetchData();
  }, []);

  return (
    <div className="App">
      <Switch>
                {/* <Route exact path="/leave" component={Leave} /> */}
                <Route exact path="/:meetingId" component={Meeting}/>
                <Route exact path="/" component={Home} />
            </Switch>
    </div>
  );
}

export default App;
