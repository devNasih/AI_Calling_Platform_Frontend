import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Phone,
  Clock,
  User,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  Play,
  Pause,
  Volume2,
  FileText,
  Brain,
  Target,
  Heart,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { useAiInsights } from "../contexts/AiInsightContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/common/Button";
import LoadingSpinner from "../components/common/LoadingSpinner";

// AI Insights List Component
const AIInsightsList: React.FC = () => {
  const navigate = useNavigate();
  const { insightsData, loading, error, refreshInsights } = useAiInsights();

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return "text-green-600 bg-green-100";
      case "negative":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-600">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p className="mb-3">{error}</p>
        <Button onClick={refreshInsights}>Retry</Button>
      </div>
    );
  }

  if (!insightsData || insightsData.insights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <FileText className="h-8 w-8 mb-2" />
        <p>No AI insights available.</p>
      </div>
    );
  }

  const summary = insightsData.summary;
  const insights = insightsData.insights;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            AI Call Insights
          </h1>
          <p className="text-gray-600 mt-1">
            View AI-generated summaries and analysis for all calls
          </p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card hover gradient>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Insights
                  </p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {summary.total_insights}
                  </p>
                </div>
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card hover gradient>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Positive
                  </p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {summary.sentiment_distribution.positive}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card hover gradient>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Neutral
                  </p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">
                    {summary.sentiment_distribution.neutral}
                  </p>
                </div>
                <Minus className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card hover gradient>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Negative
                  </p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {summary.sentiment_distribution.negative}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Calls List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card gradient>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Recent Call Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.map((call, index) => (
                <motion.div
                  key={call.call_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/ai/${call.call_id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {call.contact_name || "Unknown Contact"}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(
                            call.sentiment
                          )}`}
                        >
                          {call.sentiment}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {call.phone_number} • Campaign ID: {call.campaign_id}
                      </p>
                      <p className="text-gray-700 mb-3 line-clamp-2">
                        {call.ai_feedback || call.transcription.summary || "No summary available"}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{call.duration.formatted}</span>
                        <span>•</span>
                        <span className="capitalize">{call.call_status}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2 ml-4">
                      <div className="text-sm text-gray-500">
                        {call.duration.formatted}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(call.timestamps.initiated_at).toLocaleDateString()}
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

const AIInsights: React.FC = () => {
  const { callId } = useParams<{ callId: string }>();
  const navigate = useNavigate();
  const { insightsData, loading, error } = useAiInsights();

  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  // Find the specific call data
  const callData = insightsData?.insights.find(
    (insight) => insight.call_id.toString() === callId
  );

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case "negative":
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      default:
        return <Minus className="h-5 w-5 text-gray-600" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return "text-green-600 bg-green-100";
      case "negative":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const handlePlayPause = () => {
    if (!callData?.recording_url) return;
    
    if (isPlaying) {
      audio?.pause();
      setIsPlaying(false);
    } else {
      const newAudio = new Audio(callData.recording_url);
      newAudio.play();
      setAudio(newAudio);
      setIsPlaying(true);
      newAudio.onended = () => setIsPlaying(false);
    }
  };

  const downloadTranscript = () => {
    if (!callData) return;
    const element = document.createElement("a");
    const file = new Blob([callData.transcription.full_transcript], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `transcript-${callId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Render fallback if no callId (show list)
  if (!callId) return <AIInsightsList />;

  // Render loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Render error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-600">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p className="mb-3">{error}</p>
        <Button onClick={() => navigate("/ai")} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to AI Insights
        </Button>
      </div>
    );
  }

  // Render not found
  if (!callData) {
    return (
      <div className="text-center py-12">
        <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Call Not Found
        </h3>
        <p className="text-gray-500 mb-4">
          The requested call insights could not be loaded.
        </p>
        <Button onClick={() => navigate("/ai")} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to AI Insights
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div className="flex items-center space-x-4">
          <Button onClick={() => navigate("/ai")} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              AI Call Insights
            </h1>
            <p className="text-gray-600">Call ID: {callId}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={downloadTranscript}
            variant="outline"
            leftIcon={<Download className="h-4 w-4" />}
          >
            Download Transcript
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card gradient>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="h-5 w-5 text-blue-600" />
              <span>Call Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Contact</p>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {callData.contact_name || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {callData.phone_number}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Campaign</p>
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Campaign {callData.campaign_id}
                    </p>
                    <p className="text-sm text-gray-500">
                      ID: {callData.campaign_id}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">
                  Duration & Status
                </p>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {callData.duration.formatted}
                    </p>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(callData.call_status)}
                      <span className="text-sm text-gray-500 capitalize">
                        {callData.call_status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Sentiment</p>
                <div className="flex items-center space-x-2">
                  {getSentimentIcon(callData.sentiment)}
                  <div>
                    <div
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(
                        callData.sentiment
                      )}`}
                    >
                      {callData.sentiment.charAt(0).toUpperCase() +
                        callData.sentiment.slice(1)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Audio Player & Summary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card gradient>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Volume2 className="h-5 w-5 text-purple-600" />
                <span>Call Recording</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-center py-8 bg-gray-50 rounded-lg">
                  {callData.recording_url ? (
                    <Button
                      onClick={handlePlayPause}
                      variant="default"
                      size="lg"
                      leftIcon={
                        isPlaying ? (
                          <Pause className="h-6 w-6" />
                        ) : (
                          <Play className="h-6 w-6" />
                        )
                      }
                    >
                      {isPlaying ? "Pause Recording" : "Play Recording"}
                    </Button>
                  ) : (
                    <p className="text-gray-500">No recording available</p>
                  )}
                </div>
                <div className="text-center text-sm text-gray-500">
                  Duration: {callData.duration.formatted} • Started:{" "}
                  {new Date(callData.timestamps.initiated_at).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card gradient>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-indigo-600" />
                <span>AI Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <p className="text-gray-700 leading-relaxed">
                    {callData.ai_feedback || callData.transcription.summary || "No summary available"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Conversation Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card gradient>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-pink-600" />
              <span>Conversation Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">AI Responses</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {callData.conversation_metrics.ai_response_count}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Human Detected</p>
                  <p className={`text-lg font-semibold ${callData.conversation_metrics.human_detected ? 'text-green-600' : 'text-gray-500'}`}>
                    {callData.conversation_metrics.human_detected ? "Yes" : "No"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Conversation State</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {callData.conversation_metrics.conversation_state}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Full Transcript */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card gradient>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-green-600" />
              <span>Call Transcript</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
                {callData.transcription.full_transcript || "No transcript available"}
              </pre>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AIInsights;