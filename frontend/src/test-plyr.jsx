import React from 'react';
import { createRoot } from 'react-dom/client';
import { Plyr } from 'plyr-react';
const App = () => {
  const ref = React.useRef(null);
  React.useEffect(() => { console.log('Player is:', ref.current?.plyr); console.log('Has on:', typeof ref.current?.plyr?.on); }, []);
  return <Plyr ref={ref} source={{type: 'video', sources: [{src: 'test.mp4'}]}} />
};
const root = createRoot(document.getElementById('root'));
root.render(<App />);
