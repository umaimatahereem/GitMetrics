import { useState } from "react";
import {
  AtSign,
  Building2,
  Calendar,
  Check,
  Copy,
  ExternalLink,
  GitCompare,
  Link2,
  MapPin
} from "lucide-react";
import { formatFull, formatMonthYear } from "../utils/format";
import { comparePath } from "../utils/router";

function toHref(url) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function ProfileHeader({ profile }) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy this link:", window.location.href);
    }
  };

  const stats = [
    { label: "Followers", value: profile.followers },
    { label: "Following", value: profile.following },
    { label: "Public repos", value: profile.public_repos },
    { label: "Gists", value: profile.public_gists }
  ];

  return (
    <section className="card profile-card">
      <div className="profile-main">
        <img
          src={profile.avatar_url}
          alt={`${profile.login}'s avatar`}
          className="profile-avatar"
          width="96"
          height="96"
        />

        <div className="profile-info">
          <h1>{profile.name || profile.login}</h1>

          <a
            className="profile-username"
            href={profile.html_url}
            target="_blank"
            rel="noreferrer"
          >
            @{profile.login}
          </a>

          <p className="profile-bio">{profile.bio || "No bio available."}</p>

          <ul className="meta-list">
            {profile.location && (
              <li>
                <MapPin size={15} />
                {profile.location}
              </li>
            )}

            {profile.company && (
              <li>
                <Building2 size={15} />
                {profile.company}
              </li>
            )}

            {profile.blog && (
              <li>
                <Link2 size={15} />
                <a href={toHref(profile.blog)} target="_blank" rel="noreferrer">
                  {profile.blog.replace(/^https?:\/\//i, "")}
                </a>
              </li>
            )}

            {profile.twitter_username && (
              <li>
                <AtSign size={15} />
                {profile.twitter_username}
              </li>
            )}

            <li>
              <Calendar size={15} />
              Joined {formatMonthYear(profile.created_at)}
            </li>
          </ul>
        </div>

        <div className="profile-actions">
          <a
            className="ghost-btn"
            href={profile.html_url}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink size={16} />
            <span>GitHub</span>
          </a>

          <a className="ghost-btn" href={`#${comparePath(profile.login)}`}>
            <GitCompare size={16} />
            <span>Compare</span>
          </a>

          <button type="button" className="ghost-btn" onClick={copyLink}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? "Copied" : "Copy link"}</span>
          </button>
        </div>
      </div>

      <dl className="profile-stats">
        {stats.map((stat) => (
          <div key={stat.label} className="profile-stat">
            <dd>{formatFull(stat.value)}</dd>
            <dt>{stat.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default ProfileHeader;
