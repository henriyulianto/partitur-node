import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KoleksiLagu } from '@/models/KoleksiLagu';
import { Settings, Info, AlertTriangle, Key, Eye, EyeOff } from 'lucide-react';

const APIConfig = () => {
  const [currentSource, setCurrentSource] = useState<'workers' | 'github'>(
    KoleksiLagu.getAPISource()
  );
  const [isChanging, setIsChanging] = useState(false);
  const [githubToken, setGithubToken] = useState('');
  const [showToken, setShowToken] = useState(false);

  // Get current rate limit status
  const rateLimitStatus = KoleksiLagu.getRateLimitStatus();

  // Initialize token from localStorage on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('partitur-github-token');
    if (storedToken) {
      setGithubToken(storedToken);
    }
  }, []);

  const handleSwitch = async (newSource: 'workers' | 'github') => {
    setIsChanging(true);
    try {
      KoleksiLagu.setAPISource(newSource === 'workers');
      setCurrentSource(newSource);

      // Reload the page to apply new API source
      window.location.reload();
    } catch (error) {
      console.error('Failed to switch API source:', error);
    } finally {
      setIsChanging(false);
    }
  };

  const handleSetToken = () => {
    if (githubToken.trim()) {
      console.log('Setting GitHub token:', githubToken.substring(0, 10) + '...');
      KoleksiLagu.setGitHubToken(githubToken.trim());
      console.log('GitHub token updated - rate limits increased to 5,000/hour');

      // Update rate limit status
      const newStatus = KoleksiLagu.getRateLimitStatus();
      console.log('New rate limit status:', newStatus);

      // Reload if using GitHub API
      if (currentSource === 'github') {
        window.location.reload();
      }
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            API Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Current API Source</h3>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              {currentSource === 'workers' ? (
                <>
                  <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">W</span>
                  </div>
                  <div>
                    <p className="font-medium">Cloudflare Workers API</p>
                    <p className="text-sm text-muted-foreground">Fast, cached, edge-optimized</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">GH</span>
                  </div>
                  <div>
                    <p className="font-medium">Direct GitHub API</p>
                    <p className="text-sm text-muted-foreground">
                      Rate Limit: {githubToken ? '5,000/hour' : '60/hour'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {currentSource === 'github' && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-2">GitHub API Token</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="github-token">Personal Access Token (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="github-token"
                      type={showToken ? 'text' : 'password'}
                      value={githubToken}
                      onChange={(e) => setGithubToken(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setShowToken(!showToken)}
                    >
                      {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {githubToken && (
                    <p className="text-xs text-muted-foreground">
                      Token increases rate limit from 60/hour to 5,000/hour
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleSetToken}
                  disabled={!githubToken.trim()}
                  className="w-full"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Set GitHub Token
                </Button>
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Switch API Source</h3>
            <div className="flex gap-3">
              <Button
                onClick={() => handleSwitch('workers')}
                disabled={isChanging || currentSource === 'workers'}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Use Workers API
              </Button>

              <Button
                onClick={() => handleSwitch('github')}
                disabled={isChanging || currentSource === 'github'}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Info className="h-4 w-4" />
                Use GitHub API
              </Button>
            </div>

            {isChanging && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800">Switching API source and reloading page...</span>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Rate Limit Status</h3>
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Current Limit:</span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${rateLimitStatus.hasToken ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {rateLimitStatus.limit}/hour
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {rateLimitStatus.hasToken
                  ? '✅ Token active - Full rate limit available'
                  : '⚠️ No token - Limited to 60/hour'
                }
              </div>
            </div>

            <div className="text-xs text-muted-foreground mt-2">
              API Source: <span className="font-medium">{rateLimitStatus.source.toUpperCase()}</span>
              {rateLimitStatus.hasToken && (
                <span className="ml-2 text-green-600">• Token Set</span>
              )}
            </div>
          </div>
        </CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-muted rounded-lg">
            <h4 className="font-medium mb-1">Cloudflare Workers API</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Edge caching (5 minutes)</li>
              <li>• Higher rate limits</li>
              <li>• Better performance</li>
              <li>• Requires deployment</li>
            </ul>
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <h4 className="font-medium mb-1">Direct GitHub API</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Real-time updates</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default APIConfig;
