import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/common/Button";
import LoadingSpinner from "../components/common/LoadingSpinner";

interface CallInsight {
  id: string;
  campaignId: string;
  campaignName: string;
  contactId: string;
  contactName: string;
  contactPhone: string;
  status: "completed" | "failed" | "ongoing";
  duration: number;
  startedAt: string;
  endedAt?: string;
  transcript: string;
  summary: string;
  sentiment: "positive" | "negative" | "neutral";
  sentimentScore: number;
  keyInsights: string[];
  callRecordingUrl?: string;
  retryCount: number;
  tags: string[];
}

// Mock data for demo - in real app this would come from API
const mockCallInsight: CallInsight = {
  id: "12345",
  campaignId: "1",
  campaignName: "Summer Sales Campaign",
  contactId: "101",
  contactName: "John Smith",
  contactPhone: "+1 (555) 123-4567",
  status: "completed",
  duration: 186,
  startedAt: "2025-08-27T14:25:00Z",
  endedAt: "2025-08-27T14:28:06Z",
  transcript: `
AI Agent: Hello, this is Sarah from TechSolutions. Is this John Smith?

Customer: Yes, this is John. 

AI Agent: Hi John! I'm calling about our new cloud services that could help streamline your business operations. Do you have a couple of minutes to chat?

Customer: Sure, I guess. What kind of services are you talking about?

AI Agent: We offer automated data backup, real-time collaboration tools, and AI-powered analytics. Based on your business profile, I think our Enterprise package could save you about 30% on your current IT costs.

Customer: That sounds interesting. Can you tell me more about the pricing?

AI Agent: Absolutely! Our Enterprise package starts at $299 per month for up to 50 users. It includes 24/7 support, unlimited storage, and our AI analytics dashboard. Would you like me to send you a detailed proposal?

Customer: Yes, that would be great. Can you email it to me?

AI Agent: Of course! I'll send that over within the next hour. Is john.smith@company.com still the best email to reach you?

Customer: Yes, that's correct.

AI Agent: Perfect! You should receive the proposal shortly. Is there anything specific you'd like me to include or any questions I can answer right now?

Customer: No, I think that covers it. I'll review the proposal and get back to you.

AI Agent: Wonderful! Thank you for your time, John. Have a great day!

Customer: You too, thanks.
  `,
  summary: `Call with John Smith regarding Enterprise cloud services. Customer showed strong interest in the offering, particularly the cost savings aspect (30% reduction). Requested detailed proposal to be sent via email. Positive engagement throughout the call with no objections raised. Follow-up proposal email scheduled.`,
  sentiment: "positive",
  sentimentScore: 0.82,
  keyInsights: [
    "Customer expressed genuine interest in cost savings",
    "Ready to review proposals - high conversion potential",
    "No technical objections or concerns raised",
    "Familiar with existing cloud solutions",
    "Decision maker for IT purchases",
  ],
  callRecordingUrl: "/api/recordings/12345.mp3",
  retryCount: 0,
  tags: ["interested", "decision-maker", "follow-up-needed", "enterprise"],
};

const mockCallsList: CallInsight[] = [
  mockCallInsight,
  {
    ...mockCallInsight,
    id: "12346",
    contactName: "Sarah Johnson",
    contactPhone: "+1 (555) 234-5678",
    sentiment: "negative",
    sentimentScore: 0.25,
    summary:
      "Customer was not interested in the product offering. Mentioned already having a solution in place.",
    tags: ["not-interested", "existing-solution", "no-follow-up"],
  },
  {
    ...mockCallInsight,
    id: "12347",
    contactName: "Mike Davis",
    contactPhone: "+1 (555) 345-6789",
    sentiment: "neutral",
    sentimentScore: 0.55,
    summary:
      "Customer listened to the pitch but requested more time to think. No immediate decision made.",
    tags: ["thinking", "follow-up-needed", "undecided"],
  },
];

// AI Insights List Component
const AIInsightsList: React.FC = () => {
  const navigate = useNavigate();
  const [calls, setCalls] = useState<CallInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCalls = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setCalls(mockCallsList);
      } catch (error) {
        console.error("Error loading calls:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCalls();
  }, []);

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    Processed Calls
                  </p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {calls.length}
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
                    Positive Sentiment
                  </p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {Math.round(
                      (calls.filter((c) => c.sentiment === "positive").length /
                        calls.length) *
                        100
                    )}
                    %
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
          transition={{ delay: 0.3 }}
        >
          <Card hover gradient>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Avg Call Duration
                  </p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">
                    {formatDuration(
                      Math.round(
                        calls.reduce((acc, call) => acc + call.duration, 0) /
                          calls.length
                      )
                    )}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
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
              {calls.map((call, index) => (
                <motion.div
                  key={call.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    return navigate(`/ai/${call.id}`);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {call.contactName}
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
                        {call.contactPhone} • {call.campaignName}
                      </p>
                      <p className="text-gray-700 mb-3 line-clamp-2">
                        {call.summary}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {call.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                          >
                            {tag}
                          </span>
                        ))}
                        {call.tags.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{call.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2 ml-4">
                      <div className="text-sm text-gray-500">
                        {formatDuration(call.duration)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(call.startedAt).toLocaleDateString()}
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

  const [callData, setCallData] = useState<CallInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  // Debug logs
  console.log("=== AIInsights Mounted ===");
  console.log("callId:", callId);
  console.log("window.location.pathname:", window.location.pathname);

  // Load call data
  useEffect(() => {
    if (!callId) return;

    const loadCallData = async () => {
      try {
        setLoading(true);
        console.log("Loading call data for callId:", callId);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        console.log("Setting mock call data");
        setCallData(mockCallInsight); // Replace with real API call
      } catch (error) {
        console.error("Error loading call data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCallData();
  }, [callId]);

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case "negative":
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      default:
        return <Minus className="h-5 w-5 text-gray-600" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-600 bg-green-100";
      case "negative":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const handlePlayPause = () => setIsPlaying(!isPlaying);

  const downloadTranscript = () => {
    if (!callData) return;
    const element = document.createElement("a");
    const file = new Blob([callData.transcript], { type: "text/plain" });
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
                      {callData.contactName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {callData.contactPhone}
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
                      {callData.campaignName}
                    </p>
                    <p className="text-sm text-gray-500">
                      ID: {callData.campaignId}
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
                      {formatDuration(callData.duration)}
                    </p>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(callData.status)}
                      <span className="text-sm text-gray-500 capitalize">
                        {callData.status}
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
                    <p className="text-sm text-gray-500 mt-1">
                      Score: {(callData.sentimentScore * 100).toFixed(0)}%
                    </p>
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
                </div>
                <div className="text-center text-sm text-gray-500">
                  Duration: {formatDuration(callData.duration)} • Started:{" "}
                  {new Date(callData.startedAt).toLocaleString()}
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
                    {callData.summary}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {callData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Key Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card gradient>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-pink-600" />
              <span>Key Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {callData.keyInsights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{insight}</p>
                </motion.div>
              ))}
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
                {callData.transcript}
              </pre>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AIInsights;
