import React from "react";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Phone,
  MapPin,
  Briefcase,
  Globe,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const profileData = {
    fullName: "John Anderson",
    email: "john.anderson@example.com",
    phone: "+1 (555) 123-4567",
    role: "ADMIN",
    department: "Engineering",
    location: "San Francisco, CA",
    timezone: "PST (UTC-8)",
    memberSince: "January 2024",
    lastLogin: "October 20, 2025",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Profile Card - Landscape Layout */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3">
            {/* Left Section - Profile Header */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-8 flex flex-col items-center justify-center text-center">
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg mb-4">
                <User className="w-16 h-16 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                {profileData.fullName}
              </h1>
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-white/20 text-white backdrop-blur-sm">
                <Shield className="w-4 h-4 mr-2" />
                {user?.role}
              </span>

              
            </div>

            {/* Right Section - Profile Information Grid */}
            <div className="lg:col-span-2 p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">
                Profile Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div className="flex items-start space-x-3 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                      Email Address
                    </p>
                    <p className="text-sm text-slate-900 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start space-x-3 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                      Phone Number
                    </p>
                    <p className="text-sm text-slate-900">
                      {profileData.phone}
                    </p>
                  </div>
                </div>

                {/* Department */}
                <div className="flex items-start space-x-3 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                      Department
                    </p>
                    <p className="text-sm text-slate-900">
                      {profileData.department}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start space-x-3 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                      Location
                    </p>
                    <p className="text-sm text-slate-900">
                      {profileData.location}
                    </p>
                  </div>
                </div>

                {/* Timezone */}
                <div className="flex items-start space-x-3 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition">
                  <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                      Timezone
                    </p>
                    <p className="text-sm text-slate-900">
                      {profileData.timezone}
                    </p>
                  </div>
                </div>

                {/* Member Since */}
                <div className="flex items-start space-x-3 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                      Member Since
                    </p>
                    <p className="text-sm text-slate-900">
                      {profileData.memberSince}
                    </p>
                  </div>
                </div>
              </div>

              {/* Last Login Info */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
                      Last Login
                    </p>
                    <p className="text-sm text-blue-900">
                      {profileData.lastLogin}
                    </p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
