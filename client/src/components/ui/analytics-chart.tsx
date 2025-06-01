import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Users, Globe, TrendingUp } from "lucide-react";
import type { Analytics } from "@shared/schema";

interface AnalyticsChartProps {
  applicationId: number;
}

export function AnalyticsChart({ applicationId }: AnalyticsChartProps) {
  const { data: analytics = [], isLoading } = useQuery({
    queryKey: ["/api/applications", applicationId, "analytics"],
    queryFn: async () => {
      const response = await fetch(`/api/applications/${applicationId}/analytics?days=30`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="loading-spinner" />
      </div>
    );
  }

  // Process analytics data
  const totalVisits = analytics.length;
  const uniqueVisitors = new Set(analytics.map((a: Analytics) => a.visitorIp)).size;
  const countries = analytics.reduce((acc: Record<string, number>, curr: Analytics) => {
    if (curr.country && curr.country !== "Unknown") {
      acc[curr.country] = (acc[curr.country] || 0) + 1;
    }
    return acc;
  }, {});
  const topCountries = Object.entries(countries)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5);

  // Group visits by day
  const visitsByDay = analytics.reduce((acc: Record<string, number>, curr: Analytics) => {
    const day = new Date(curr.visitedAt!).toLocaleDateString();
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(visitsByDay)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .slice(-7); // Last 7 days

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-morphism border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-gray-400">Total Visits</p>
                <p className="text-2xl font-bold">{totalVisits}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-morphism border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Unique Visitors</p>
                <p className="text-2xl font-bold">{uniqueVisitors}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-morphism border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">Avg. Daily Visits</p>
                <p className="text-2xl font-bold">
                  {Math.round(totalVisits / Math.max(chartData.length, 1))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Visits Chart */}
        <Card className="glass-morphism border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Daily Visits (Last 7 Days)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="space-y-4">
                {chartData.map(([date, visits]) => (
                  <div key={date} className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">{date}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${Math.max((visits as number) / Math.max(...chartData.map(([, v]) => v as number)) * 100, 5)}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">{visits}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No visit data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Countries */}
        <Card className="glass-morphism border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="w-5 h-5" />
              <span>Top Countries</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topCountries.length > 0 ? (
              <div className="space-y-3">
                {topCountries.map(([country, visits]) => (
                  <div key={country} className="flex items-center justify-between">
                    <span className="text-sm">{country}</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {visits} visits
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {Math.round(((visits as number) / totalVisits) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Globe className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No geographic data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Visits */}
      <Card className="glass-morphism border-gray-700">
        <CardHeader>
          <CardTitle>Recent Visits</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {analytics.slice(0, 20).map((visit: Analytics, index: number) => (
                <div key={index} className="flex items-center justify-between text-sm border-b border-gray-700/50 pb-2">
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="text-xs">
                      {visit.country || "Unknown"}
                    </Badge>
                    <span className="text-gray-400">{visit.path || "/"}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(visit.visitedAt!).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No visits recorded yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
