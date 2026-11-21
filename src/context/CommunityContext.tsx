import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Timestamp,
} from 'firebase/firestore';
import { toast } from 'sonner';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from '@/src/lib/firebase';
import {
  CURATED_ORGANIZATIONS,
  CURATED_OUTINGS,
  CURATED_POSTS,
  getDisciplineImage,
  type DirectoryOrganization,
  type Discipline,
  type OrgType,
  type Region,
  type SeedOuting,
  type SeedPost,
} from '@/src/data/seedOrganizations';
import { sanitizeString, sanitizeUrl, SCHEMA_LIMITS, slugifyId } from '@/src/lib/validation';

export interface MemberProfile {
  uid: string;
  displayName: string;
  homeRegion: string;
  bio: string;
  disciplines: string[];
  photoURL: string;
  visibility: 'public';
}

export interface ClubMembership {
  id: string;
  userId: string;
  userName: string;
  orgId: string;
  orgName: string;
  createdAtMs: number;
}

export interface ClubBookmarkItem {
  id: string;
  userId: string;
  orgId: string;
  orgName: string;
  createdAtMs: number;
}

export interface FieldPostItem extends SeedPost {
  createdAtMs: number;
}

export interface PostLikeItem {
  id: string;
  userId: string;
  postId: string;
}

export interface PostCommentItem {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAtMs: number;
}

export interface OutingItem extends SeedOuting {
  createdAtMs: number;
}

export interface OutingRsvpItem {
  id: string;
  userId: string;
  userName: string;
  outingId: string;
  status: 'going';
  createdAtMs: number;
}

export interface MemberFollowItem {
  id: string;
  followerId: string;
  followerName: string;
  targetUserId: string;
  targetUserName: string;
  createdAtMs: number;
}

export interface CarpoolOfferItem {
  id: string;
  outingId: string;
  hostId: string;
  hostName: string;
  offerType: 'carpool' | 'gear';
  departurePoint: string;
  itemSummary: string;
  totalSlots: number;
  notes: string;
  createdAtMs: number;
}

export interface CarpoolClaimItem {
  id: string;
  offerId: string;
  outingId: string;
  userId: string;
  userName: string;
  createdAtMs: number;
}

export interface ClubClaimItem {
  id: string;
  orgId: string;
  orgName: string;
  requesterId: string;
  requesterName: string;
  roleTitle: string;
  proposedSummary: string;
  proposedWebsite: string;
  proposedChapterCount: string;
  notes: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAtMs: number;
}

export interface SubmitOrganizationInput {
  name: string;
  discipline: Discipline;
  orgType: OrgType;
  region: Region;
  location: string;
  founded: string;
  chapterCount: string;
  website: string;
  instagram: string;
  summary: string;
}

export interface CreatePostInput {
  orgId: string;
  orgName: string;
  category: SeedPost['category'];
  title: string;
  body: string;
  location: string;
}

export interface CreateOutingInput {
  orgId: string;
  orgName: string;
  title: string;
  discipline: Discipline;
  dateLabel: string;
  location: string;
  region: Region;
  difficulty: SeedOuting['difficulty'];
  maxSpots: number;
  description: string;
}

export interface CreateCarpoolOfferInput {
  outingId: string;
  offerType: 'carpool' | 'gear';
  departurePoint: string;
  itemSummary: string;
  totalSlots: number;
  notes: string;
}

export interface SubmitClubClaimInput {
  orgId: string;
  orgName: string;
  roleTitle: string;
  proposedSummary: string;
  proposedWebsite: string;
  proposedChapterCount: string;
  notes: string;
}

interface CommunityContextValue {
  user: User | null;
  isAdmin: boolean;
  authReady: boolean;
  signingIn: boolean;
  currentProfile: MemberProfile | null;
  profiles: MemberProfile[];
  organizations: DirectoryOrganization[];
  memberships: ClubMembership[];
  bookmarks: ClubBookmarkItem[];
  posts: FieldPostItem[];
  postLikes: PostLikeItem[];
  postComments: PostCommentItem[];
  outings: OutingItem[];
  rsvps: OutingRsvpItem[];
  follows: MemberFollowItem[];
  carpoolOffers: CarpoolOfferItem[];
  carpoolClaims: CarpoolClaimItem[];
  clubClaims: ClubClaimItem[];
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  updateProfile: (input: {
    displayName: string;
    homeRegion: string;
    bio: string;
    disciplines: string[];
  }) => Promise<void>;
  toggleClubMembership: (org: DirectoryOrganization) => Promise<void>;
  toggleClubBookmark: (org: DirectoryOrganization) => Promise<void>;
  toggleFollowMember: (target: MemberProfile) => Promise<void>;
  submitOrganization: (input: SubmitOrganizationInput) => Promise<DirectoryOrganization | null>;
  updateOrganization: (orgId: string, input: SubmitOrganizationInput) => Promise<boolean>;
  deleteOrganization: (orgId: string) => Promise<void>;
  createPost: (input: CreatePostInput) => Promise<boolean>;
  deletePost: (postId: string) => Promise<void>;
  togglePostLike: (postId: string) => Promise<void>;
  addComment: (postId: string, body: string) => Promise<boolean>;
  deleteComment: (commentId: string) => Promise<void>;
  createOuting: (input: CreateOutingInput) => Promise<boolean>;
  deleteOuting: (outingId: string) => Promise<void>;
  toggleOutingRsvp: (outing: OutingItem) => Promise<void>;
  createCarpoolOffer: (input: CreateCarpoolOfferInput) => Promise<boolean>;
  deleteCarpoolOffer: (offerId: string) => Promise<void>;
  toggleCarpoolClaim: (offer: CarpoolOfferItem) => Promise<void>;
  submitClubClaim: (input: SubmitClubClaimInput) => Promise<boolean>;
  reviewClubClaim: (claimId: string, status: 'approved' | 'rejected') => Promise<void>;
}

const CommunityContext = createContext<CommunityContextValue | null>(null);

function formatTimestamp(ts?: Timestamp | null): { label: string; ms: number } {
  if (!ts || typeof ts.toMillis !== 'function') {
    return { label: 'Just now', ms: Date.now() };
  }
  const ms = ts.toMillis();
  const diffMin = Math.floor((Date.now() - ms) / 60000);
  if (diffMin < 1) return { label: 'Just now', ms };
  if (diffMin < 60) return { label: `${diffMin}m ago`, ms };
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return { label: `${diffHr}h ago`, ms };
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 14) return { label: `${diffDay}d ago`, ms };
  return {
    label: new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    ms,
  };
}

export function CommunityProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  const [profiles, setProfiles] = useState<MemberProfile[]>([]);
  const [communityOrgs, setCommunityOrgs] = useState<DirectoryOrganization[]>([]);
  const [memberships, setMemberships] = useState<ClubMembership[]>([]);
  const [bookmarks, setBookmarks] = useState<ClubBookmarkItem[]>([]);
  const [communityPosts, setCommunityPosts] = useState<FieldPostItem[]>([]);
  const [postLikes, setPostLikes] = useState<PostLikeItem[]>([]);
  const [postComments, setPostComments] = useState<PostCommentItem[]>([]);
  const [communityOutings, setCommunityOutings] = useState<OutingItem[]>([]);
  const [rsvps, setRsvps] = useState<OutingRsvpItem[]>([]);
  const [follows, setFollows] = useState<MemberFollowItem[]>([]);
  const [carpoolOffers, setCarpoolOffers] = useState<CarpoolOfferItem[]>([]);
  const [carpoolClaims, setCarpoolClaims] = useState<CarpoolClaimItem[]>([]);
  const [clubClaims, setClubClaims] = useState<ClubClaimItem[]>([]);

  const isAdmin = Boolean(
    user && user.emailVerified && user.email === 'samuel.kinyanjui.sk@gmail.com'
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);

      if (nextUser && nextUser.emailVerified) {
        try {
          const userRef = doc(db, 'users', nextUser.uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              uid: nextUser.uid,
              email: sanitizeString(nextUser.email || 'member@fieldline.community', 254),
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }

          const profileRef = doc(db, 'profiles', nextUser.uid);
          const profileSnap = await getDoc(profileRef);
          if (!profileSnap.exists()) {
            const rawName = nextUser.displayName || nextUser.email?.split('@')[0] || 'Trail Member';
            await setDoc(profileRef, {
              uid: nextUser.uid,
              displayName: sanitizeString(rawName.length >= 2 ? rawName : 'Trail Member', SCHEMA_LIMITS.displayName.max),
              homeRegion: 'National',
              bio: 'Exploring trails, waterways, and local chapters across the Fieldline network.',
              disciplines: ['Hiking & Camping'],
              photoURL: sanitizeString(nextUser.photoURL || '', SCHEMA_LIMITS.photoURL.max),
              visibility: 'public',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        } catch (err) {
          console.error('Error initializing member records:', err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Attach Firestore real-time listeners only after auth is ready and user is signed in
  useEffect(() => {
    if (!authReady || !user) {
      setProfiles([]);
      setCommunityOrgs([]);
      setMemberships([]);
      setBookmarks([]);
      setCommunityPosts([]);
      setPostLikes([]);
      setPostComments([]);
      setCommunityOutings([]);
      setRsvps([]);
      setFollows([]);
      setCarpoolOffers([]);
      setCarpoolClaims([]);
      setClubClaims([]);
      return;
    }

    const unsubProfiles = onSnapshot(
      query(collection(db, 'profiles'), where('visibility', '==', 'public')),
      (snapshot) => {
        const list: MemberProfile[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            uid: String(data.uid || d.id),
            displayName: String(data.displayName || 'Trail Member'),
            homeRegion: String(data.homeRegion || 'National'),
            bio: String(data.bio || ''),
            disciplines: Array.isArray(data.disciplines) ? data.disciplines.map(String) : [],
            photoURL: String(data.photoURL || ''),
            visibility: 'public',
          };
        });
        setProfiles(list);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'profiles')
    );

    const unsubOrgs = onSnapshot(
      query(collection(db, 'organizations'), where('visibility', '==', 'public')),
      (snapshot) => {
        const list: DirectoryOrganization[] = snapshot.docs.map((d) => {
          const data = d.data();
          const discipline = data.discipline as Discipline;
          return {
            id: d.id,
            name: String(data.name || ''),
            discipline,
            orgType: data.orgType as OrgType,
            region: data.region as Region,
            location: String(data.location || ''),
            founded: String(data.founded || ''),
            chapterCount: String(data.chapterCount || 'Local Chapter'),
            website: String(data.website || ''),
            instagram: String(data.instagram || ''),
            summary: String(data.summary || ''),
            highlights: [
              `Submitted by ${String(data.authorName || 'Community Member')}`,
              `${String(data.orgType || 'Outdoor Club')} serving ${String(data.region || 'National')}`,
            ],
            imageUrl: getDisciplineImage(discipline),
            source: 'community',
            authorId: String(data.authorId || ''),
            authorName: String(data.authorName || ''),
          };
        });
        setCommunityOrgs(list);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'organizations')
    );

    const unsubMemberships = onSnapshot(
      query(collection(db, 'memberships'), where('visibility', '==', 'public')),
      (snapshot) => {
        setMemberships(
          snapshot.docs.map((d) => {
            const data = d.data();
            const ts = data.createdAt as Timestamp | null;
            return {
              id: d.id,
              userId: String(data.userId || ''),
              userName: String(data.userName || 'Member'),
              orgId: String(data.orgId || ''),
              orgName: String(data.orgName || ''),
              createdAtMs: ts && typeof ts.toMillis === 'function' ? ts.toMillis() : Date.now(),
            };
          })
        );
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'memberships')
    );

    const unsubBookmarks = onSnapshot(
      query(collection(db, 'bookmarks'), where('userId', '==', user.uid)),
      (snapshot) => {
        setBookmarks(
          snapshot.docs.map((d) => {
            const data = d.data();
            const ts = data.createdAt as Timestamp | null;
            return {
              id: d.id,
              userId: String(data.userId || ''),
              orgId: String(data.orgId || ''),
              orgName: String(data.orgName || ''),
              createdAtMs: ts && typeof ts.toMillis === 'function' ? ts.toMillis() : Date.now(),
            };
          })
        );
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'bookmarks')
    );

    const unsubPosts = onSnapshot(
      query(collection(db, 'posts'), where('visibility', '==', 'public')),
      (snapshot) => {
        const list: FieldPostItem[] = snapshot.docs.map((d) => {
          const data = d.data();
          const formatted = formatTimestamp(data.createdAt as Timestamp | null);
          return {
            id: d.id,
            authorId: String(data.authorId || ''),
            authorName: String(data.authorName || 'Member'),
            authorRegion: String(data.authorRegion || 'National'),
            orgId: String(data.orgId || ''),
            orgName: String(data.orgName || 'Fieldline Commons'),
            category: data.category as SeedPost['category'],
            title: String(data.title || ''),
            body: String(data.body || ''),
            location: String(data.location || ''),
            timestampLabel: formatted.label,
            createdAtMs: formatted.ms,
            source: 'community',
          };
        });
        setCommunityPosts(list);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'posts')
    );

    const unsubLikes = onSnapshot(
      query(collection(db, 'postLikes'), where('visibility', '==', 'public')),
      (snapshot) => {
        setPostLikes(
          snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              userId: String(data.userId || ''),
              postId: String(data.postId || ''),
            };
          })
        );
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'postLikes')
    );

    const unsubComments = onSnapshot(
      query(collection(db, 'postComments'), where('visibility', '==', 'public')),
      (snapshot) => {
        const list: PostCommentItem[] = snapshot.docs
          .map((d) => {
            const data = d.data();
            const ts = data.createdAt as Timestamp | null;
            return {
              id: d.id,
              postId: String(data.postId || ''),
              authorId: String(data.authorId || ''),
              authorName: String(data.authorName || 'Member'),
              body: String(data.body || ''),
              createdAtMs: ts && typeof ts.toMillis === 'function' ? ts.toMillis() : Date.now(),
            };
          })
          .sort((a, b) => a.createdAtMs - b.createdAtMs);
        setPostComments(list);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'postComments')
    );

    const unsubOutings = onSnapshot(
      query(collection(db, 'outings'), where('visibility', '==', 'public')),
      (snapshot) => {
        const list: OutingItem[] = snapshot.docs.map((d) => {
          const data = d.data();
          const ts = data.createdAt as Timestamp | null;
          return {
            id: d.id,
            hostId: String(data.hostId || ''),
            hostName: String(data.hostName || 'Member'),
            orgId: String(data.orgId || ''),
            orgName: String(data.orgName || 'Fieldline Commons'),
            title: String(data.title || ''),
            discipline: data.discipline as Discipline,
            dateLabel: String(data.dateLabel || ''),
            location: String(data.location || ''),
            region: data.region as Region,
            difficulty: data.difficulty as SeedOuting['difficulty'],
            maxSpots: Number(data.maxSpots || 20),
            description: String(data.description || ''),
            source: 'community',
            createdAtMs: ts && typeof ts.toMillis === 'function' ? ts.toMillis() : Date.now(),
          };
        });
        setCommunityOutings(list);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'outings')
    );

    const unsubRsvps = onSnapshot(
      query(collection(db, 'rsvps'), where('visibility', '==', 'public')),
      (snapshot) => {
        setRsvps(
          snapshot.docs.map((d) => {
            const data = d.data();
            const ts = data.createdAt as Timestamp | null;
            return {
              id: d.id,
              userId: String(data.userId || ''),
              userName: String(data.userName || 'Member'),
              outingId: String(data.outingId || ''),
              status: 'going',
              createdAtMs: ts && typeof ts.toMillis === 'function' ? ts.toMillis() : Date.now(),
            };
          })
        );
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'rsvps')
    );

    const unsubFollows = onSnapshot(
      query(collection(db, 'follows'), where('visibility', '==', 'public')),
      (snapshot) => {
        setFollows(
          snapshot.docs.map((d) => {
            const data = d.data();
            const ts = data.createdAt as Timestamp | null;
            return {
              id: d.id,
              followerId: String(data.followerId || ''),
              followerName: String(data.followerName || 'Member'),
              targetUserId: String(data.targetUserId || ''),
              targetUserName: String(data.targetUserName || 'Member'),
              createdAtMs: ts && typeof ts.toMillis === 'function' ? ts.toMillis() : Date.now(),
            };
          })
        );
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'follows')
    );

    const unsubCarpoolOffers = onSnapshot(
      query(collection(db, 'carpoolOffers'), where('visibility', '==', 'public')),
      (snapshot) => {
        setCarpoolOffers(
          snapshot.docs
            .map((d) => {
              const data = d.data();
              const ts = data.createdAt as Timestamp | null;
              return {
                id: d.id,
                outingId: String(data.outingId || ''),
                hostId: String(data.hostId || ''),
                hostName: String(data.hostName || 'Member'),
                offerType: (data.offerType === 'gear' ? 'gear' : 'carpool') as 'carpool' | 'gear',
                departurePoint: String(data.departurePoint || ''),
                itemSummary: String(data.itemSummary || ''),
                totalSlots: Number(data.totalSlots || 1),
                notes: String(data.notes || ''),
                createdAtMs: ts && typeof ts.toMillis === 'function' ? ts.toMillis() : Date.now(),
              };
            })
            .sort((a, b) => b.createdAtMs - a.createdAtMs)
        );
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'carpoolOffers')
    );

    const unsubCarpoolClaims = onSnapshot(
      query(collection(db, 'carpoolClaims'), where('visibility', '==', 'public')),
      (snapshot) => {
        setCarpoolClaims(
          snapshot.docs.map((d) => {
            const data = d.data();
            const ts = data.createdAt as Timestamp | null;
            return {
              id: d.id,
              offerId: String(data.offerId || ''),
              outingId: String(data.outingId || ''),
              userId: String(data.userId || ''),
              userName: String(data.userName || 'Member'),
              createdAtMs: ts && typeof ts.toMillis === 'function' ? ts.toMillis() : Date.now(),
            };
          })
        );
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'carpoolClaims')
    );

    const claimsQuery = isAdmin
      ? collection(db, 'clubClaims')
      : query(collection(db, 'clubClaims'), where('requesterId', '==', user.uid));

    const unsubClubClaims = onSnapshot(
      claimsQuery,
      (snapshot) => {
        setClubClaims(
          snapshot.docs
            .map((d) => {
              const data = d.data();
              const ts = data.createdAt as Timestamp | null;
              return {
                id: d.id,
                orgId: String(data.orgId || ''),
                orgName: String(data.orgName || ''),
                requesterId: String(data.requesterId || ''),
                requesterName: String(data.requesterName || 'Member'),
                roleTitle: String(data.roleTitle || ''),
                proposedSummary: String(data.proposedSummary || ''),
                proposedWebsite: String(data.proposedWebsite || ''),
                proposedChapterCount: String(data.proposedChapterCount || ''),
                notes: String(data.notes || ''),
                status: (data.status as ClubClaimItem['status']) || 'pending',
                createdAtMs: ts && typeof ts.toMillis === 'function' ? ts.toMillis() : Date.now(),
              };
            })
            .sort((a, b) => b.createdAtMs - a.createdAtMs)
        );
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'clubClaims')
    );

    return () => {
      unsubProfiles();
      unsubOrgs();
      unsubMemberships();
      unsubBookmarks();
      unsubPosts();
      unsubLikes();
      unsubComments();
      unsubOutings();
      unsubRsvps();
      unsubFollows();
      unsubCarpoolOffers();
      unsubCarpoolClaims();
      unsubClubClaims();
    };
  }, [authReady, user, isAdmin]);

  const currentProfile = useMemo(() => {
    if (!user) return null;
    return (
      profiles.find((p) => p.uid === user.uid) || {
        uid: user.uid,
        displayName: user.displayName || 'Trail Member',
        homeRegion: 'National',
        bio: '',
        disciplines: ['Hiking & Camping'],
        photoURL: user.photoURL || '',
        visibility: 'public' as const,
      }
    );
  }, [profiles, user]);

  const organizations = useMemo(() => {
    return [...communityOrgs, ...CURATED_ORGANIZATIONS];
  }, [communityOrgs]);

  const posts = useMemo<FieldPostItem[]>(() => {
    const curatedWithMs: FieldPostItem[] = CURATED_POSTS.map((p, index) => ({
      ...p,
      createdAtMs: Date.now() - (index + 1) * 86_400_000 * 2,
    }));
    return [...communityPosts, ...curatedWithMs].sort((a, b) => b.createdAtMs - a.createdAtMs);
  }, [communityPosts]);

  const outings = useMemo<OutingItem[]>(() => {
    const curatedWithMs: OutingItem[] = CURATED_OUTINGS.map((o, index) => ({
      ...o,
      createdAtMs: Date.now() - (index + 1) * 1000,
    }));
    return [...communityOutings, ...curatedWithMs].sort((a, b) => b.createdAtMs - a.createdAtMs);
  }, [communityOutings]);

  const signInWithGoogle = async () => {
    setSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Signed in to Fieldline.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to sign in.';
      if (!msg.includes('popup-closed-by-user')) {
        toast.error('Sign-in was interrupted. Please try again.');
      }
    } finally {
      setSigningIn(false);
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out.');
    } catch {
      toast.error('Could not sign out cleanly.');
    }
  };

  const requireSignedIn = async (): Promise<User | null> => {
    if (user && user.emailVerified) return user;
    toast.info('Sign in with Google to participate in the Fieldline community.');
    await signInWithGoogle();
    return auth.currentUser;
  };

  const updateProfile = async (input: {
    displayName: string;
    homeRegion: string;
    bio: string;
    disciplines: string[];
  }) => {
    const activeUser = await requireSignedIn();
    if (!activeUser) return;

    const displayName = sanitizeString(input.displayName, SCHEMA_LIMITS.displayName.max);
    const homeRegion = sanitizeString(input.homeRegion, SCHEMA_LIMITS.homeRegion.max);
    const bio = sanitizeString(input.bio, SCHEMA_LIMITS.bio.max);
    const disciplines = input.disciplines
      .map((d) => sanitizeString(d, 40))
      .filter(Boolean)
      .slice(0, SCHEMA_LIMITS.maxDisciplines);

    if (displayName.length < SCHEMA_LIMITS.displayName.min) {
      toast.error('Display name must be at least 2 characters.');
      return;
    }
    if (homeRegion.length < SCHEMA_LIMITS.homeRegion.min) {
      toast.error('Home region must be at least 2 characters.');
      return;
    }

    const path = `profiles/${activeUser.uid}`;
    try {
      await updateDoc(doc(db, 'profiles', activeUser.uid), {
        displayName,
        homeRegion,
        bio,
        disciplines,
        photoURL: sanitizeString(activeUser.photoURL || '', SCHEMA_LIMITS.photoURL.max),
        updatedAt: serverTimestamp(),
      });
      toast.success('Profile updated.');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const toggleClubMembership = async (org: DirectoryOrganization) => {
    const activeUser = await requireSignedIn();
    if (!activeUser) return;

    const membershipId = `${activeUser.uid}_${org.id}`;
    const existingMembership = memberships.find((m) => m.id === membershipId);
    const path = `memberships/${membershipId}`;

    try {
      if (existingMembership) {
        await deleteDoc(doc(db, 'memberships', membershipId));
        toast.success(`Left ${org.name}.`);
      } else {
        const userName = sanitizeString(
          currentProfile?.displayName || activeUser.displayName || 'Trail Member',
          SCHEMA_LIMITS.displayName.max
        );
        await setDoc(doc(db, 'memberships', membershipId), {
          userId: activeUser.uid,
          userName: userName.length >= 2 ? userName : 'Trail Member',
          orgId: sanitizeString(org.id, SCHEMA_LIMITS.maxIdLength),
          orgName: sanitizeString(org.name, SCHEMA_LIMITS.orgName.max),
          visibility: 'public',
          createdAt: serverTimestamp(),
        });
        toast.success(`Joined ${org.name}.`);
      }
    } catch (error) {
      handleFirestoreError(
        error,
        existingMembership ? OperationType.DELETE : OperationType.CREATE,
        path
      );
    }
  };

  const toggleClubBookmark = async (org: DirectoryOrganization) => {
    const activeUser = await requireSignedIn();
    if (!activeUser) return;

    const bookmarkId = `${activeUser.uid}_${org.id}`;
    const existingBookmark = bookmarks.find((b) => b.id === bookmarkId);
    const path = `bookmarks/${bookmarkId}`;

    try {
      if (existingBookmark) {
        await deleteDoc(doc(db, 'bookmarks', bookmarkId));
        toast.success(`Removed ${org.name} from saved clubs.`);
      } else {
        await setDoc(doc(db, 'bookmarks', bookmarkId), {
          userId: activeUser.uid,
          orgId: sanitizeString(org.id, SCHEMA_LIMITS.maxIdLength),
          orgName: sanitizeString(org.name, SCHEMA_LIMITS.orgName.max),
          createdAt: serverTimestamp(),
        });
        toast.success(`Saved ${org.name} to your trail list.`);
      }
    } catch (error) {
      handleFirestoreError(
        error,
        existingBookmark ? OperationType.DELETE : OperationType.CREATE,
        path
      );
    }
  };

  const toggleFollowMember = async (target: MemberProfile) => {
    const activeUser = await requireSignedIn();
    if (!activeUser || target.uid === activeUser.uid) return;

    const followId = `${activeUser.uid}_${target.uid}`;
    const existingFollow = follows.find((f) => f.id === followId);
    const path = `follows/${followId}`;

    try {
      if (existingFollow) {
        await deleteDoc(doc(db, 'follows', followId));
        toast.success(`Unfollowed ${target.displayName}.`);
      } else {
        const followerName = sanitizeString(
          currentProfile?.displayName || activeUser.displayName || 'Trail Member',
          SCHEMA_LIMITS.displayName.max
        );
        await setDoc(doc(db, 'follows', followId), {
          followerId: activeUser.uid,
          followerName: followerName.length >= 2 ? followerName : 'Trail Member',
          targetUserId: sanitizeString(target.uid, SCHEMA_LIMITS.maxIdLength),
          targetUserName: sanitizeString(
            target.displayName.length >= 2 ? target.displayName : 'Trail Member',
            SCHEMA_LIMITS.displayName.max
          ),
          visibility: 'public',
          createdAt: serverTimestamp(),
        });
        toast.success(`Following ${target.displayName}.`);
      }
    } catch (error) {
      handleFirestoreError(
        error,
        existingFollow ? OperationType.DELETE : OperationType.CREATE,
        path
      );
    }
  };

  const submitOrganization = async (
    input: SubmitOrganizationInput
  ): Promise<DirectoryOrganization | null> => {
    const activeUser = await requireSignedIn();
    if (!activeUser) return null;

    const name = sanitizeString(input.name, SCHEMA_LIMITS.orgName.max);
    const location = sanitizeString(input.location, SCHEMA_LIMITS.location.max);
    const founded = sanitizeString(input.founded || '2024', SCHEMA_LIMITS.founded.max);
    const chapterCount = sanitizeString(input.chapterCount || 'Local Chapter', SCHEMA_LIMITS.chapterCount.max);
    const website = sanitizeUrl(input.website);
    const instagram = sanitizeString(input.instagram, SCHEMA_LIMITS.instagram.max);
    const summary = sanitizeString(input.summary, SCHEMA_LIMITS.summary.max);

    if (name.length < SCHEMA_LIMITS.orgName.min) {
      toast.error('Organization name must be at least 2 characters.');
      return null;
    }
    if (location.length < SCHEMA_LIMITS.location.min) {
      toast.error('Please enter a city, state, or regional base.');
      return null;
    }
    if (founded.length < SCHEMA_LIMITS.founded.min) {
      toast.error('Please enter a 4-digit founding year.');
      return null;
    }
    if (summary.length < SCHEMA_LIMITS.summary.min) {
      toast.error('Mission summary must be at least 20 characters.');
      return null;
    }

    const orgId = slugifyId(name);
    const authorName = sanitizeString(
      currentProfile?.displayName || activeUser.displayName || 'Community Member',
      SCHEMA_LIMITS.displayName.max
    );
    const path = `organizations/${orgId}`;

    try {
      await setDoc(doc(db, 'organizations', orgId), {
        name,
        discipline: input.discipline,
        orgType: input.orgType,
        region: input.region,
        location,
        founded,
        chapterCount,
        website,
        instagram,
        summary,
        authorId: activeUser.uid,
        authorName: authorName.length >= 2 ? authorName : 'Community Member',
        visibility: 'public',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success(`${name} added to the directory.`);
      return {
        id: orgId,
        name,
        discipline: input.discipline,
        orgType: input.orgType,
        region: input.region,
        location,
        founded,
        chapterCount,
        website,
        instagram,
        summary,
        highlights: [`Submitted by ${authorName}`],
        imageUrl: getDisciplineImage(input.discipline),
        source: 'community',
        authorId: activeUser.uid,
        authorName,
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const updateOrganization = async (
    orgId: string,
    input: SubmitOrganizationInput
  ): Promise<boolean> => {
    const activeUser = await requireSignedIn();
    if (!activeUser) return false;

    const name = sanitizeString(input.name, SCHEMA_LIMITS.orgName.max);
    const location = sanitizeString(input.location, SCHEMA_LIMITS.location.max);
    const founded = sanitizeString(input.founded || '2024', SCHEMA_LIMITS.founded.max);
    const chapterCount = sanitizeString(
      input.chapterCount || 'Local Chapter',
      SCHEMA_LIMITS.chapterCount.max
    );
    const website = sanitizeUrl(input.website);
    const instagram = sanitizeString(input.instagram, SCHEMA_LIMITS.instagram.max);
    const summary = sanitizeString(input.summary, SCHEMA_LIMITS.summary.max);

    if (name.length < SCHEMA_LIMITS.orgName.min || summary.length < SCHEMA_LIMITS.summary.min) {
      toast.error('Please enter a valid organization name and 20+ character summary.');
      return false;
    }

    const path = `organizations/${orgId}`;
    try {
      await updateDoc(doc(db, 'organizations', orgId), {
        name,
        discipline: input.discipline,
        orgType: input.orgType,
        region: input.region,
        location,
        founded,
        chapterCount,
        website,
        instagram,
        summary,
        updatedAt: serverTimestamp(),
      });
      toast.success(`${name} updated.`);
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const deleteOrganization = async (orgId: string) => {
    const activeUser = await requireSignedIn();
    if (!activeUser) return;
    const path = `organizations/${orgId}`;
    try {
      await deleteDoc(doc(db, 'organizations', orgId));
      toast.success('Organization listing removed.');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const createPost = async (input: CreatePostInput): Promise<boolean> => {
    const activeUser = await requireSignedIn();
    if (!activeUser) return false;

    const title = sanitizeString(input.title, SCHEMA_LIMITS.postTitle.max);
    const body = sanitizeString(input.body, SCHEMA_LIMITS.postBody.max);
    const location = sanitizeString(input.location, SCHEMA_LIMITS.location.max);

    if (title.length < SCHEMA_LIMITS.postTitle.min) {
      toast.error('Post headline must be at least 4 characters.');
      return false;
    }
    if (body.length < SCHEMA_LIMITS.postBody.min) {
      toast.error('Post details must be at least 10 characters.');
      return false;
    }

    const postId = slugifyId(title);
    const authorName = sanitizeString(
      currentProfile?.displayName || activeUser.displayName || 'Trail Member',
      SCHEMA_LIMITS.displayName.max
    );
    const authorRegion = sanitizeString(
      currentProfile?.homeRegion || 'National',
      SCHEMA_LIMITS.homeRegion.max
    );
    const path = `posts/${postId}`;

    try {
      await setDoc(doc(db, 'posts', postId), {
        authorId: activeUser.uid,
        authorName: authorName.length >= 2 ? authorName : 'Trail Member',
        authorRegion: authorRegion.length >= 2 ? authorRegion : 'National',
        orgId: sanitizeString(input.orgId, SCHEMA_LIMITS.maxIdLength),
        orgName: sanitizeString(input.orgName || 'Fieldline Commons', SCHEMA_LIMITS.orgName.max),
        category: input.category,
        title,
        body,
        location,
        visibility: 'public',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success('Field note published.');
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const deletePost = async (postId: string) => {
    const activeUser = await requireSignedIn();
    if (!activeUser) return;
    const path = `posts/${postId}`;
    try {
      await deleteDoc(doc(db, 'posts', postId));
      toast.success('Field note deleted.');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const togglePostLike = async (postId: string) => {
    const activeUser = await requireSignedIn();
    if (!activeUser) return;

    const likeId = `${activeUser.uid}_${postId}`;
    const existingLike = postLikes.find((l) => l.id === likeId);
    const path = `postLikes/${likeId}`;

    try {
      if (existingLike) {
        await deleteDoc(doc(db, 'postLikes', likeId));
      } else {
        await setDoc(doc(db, 'postLikes', likeId), {
          userId: activeUser.uid,
          postId: sanitizeString(postId, SCHEMA_LIMITS.maxIdLength),
          visibility: 'public',
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      handleFirestoreError(
        error,
        existingLike ? OperationType.DELETE : OperationType.CREATE,
        path
      );
    }
  };

  const addComment = async (postId: string, rawBody: string): Promise<boolean> => {
    const activeUser = await requireSignedIn();
    if (!activeUser) return false;

    const body = sanitizeString(rawBody, SCHEMA_LIMITS.commentBody.max);
    if (body.length < SCHEMA_LIMITS.commentBody.min) {
      toast.error('Reply must be at least 2 characters.');
      return false;
    }

    const commentId = slugifyId('reply');
    const authorName = sanitizeString(
      currentProfile?.displayName || activeUser.displayName || 'Trail Member',
      SCHEMA_LIMITS.displayName.max
    );
    const path = `postComments/${commentId}`;

    try {
      await setDoc(doc(db, 'postComments', commentId), {
        postId: sanitizeString(postId, SCHEMA_LIMITS.maxIdLength),
        authorId: activeUser.uid,
        authorName: authorName.length >= 2 ? authorName : 'Trail Member',
        body,
        visibility: 'public',
        createdAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const deleteComment = async (commentId: string) => {
    const activeUser = await requireSignedIn();
    if (!activeUser) return;
    const path = `postComments/${commentId}`;
    try {
      await deleteDoc(doc(db, 'postComments', commentId));
      toast.success('Reply removed.');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const createOuting = async (input: CreateOutingInput): Promise<boolean> => {
    const activeUser = await requireSignedIn();
    if (!activeUser) return false;

    const title = sanitizeString(input.title, SCHEMA_LIMITS.outingTitle.max);
    const dateLabel = sanitizeString(input.dateLabel, SCHEMA_LIMITS.outingDateLabel.max);
    const location = sanitizeString(input.location, SCHEMA_LIMITS.outingLocation.max);
    const description = sanitizeString(input.description, SCHEMA_LIMITS.outingDescription.max);
    const maxSpots = Math.max(
      SCHEMA_LIMITS.outingSpots.min,
      Math.min(SCHEMA_LIMITS.outingSpots.max, Math.round(Number(input.maxSpots) || 20))
    );

    if (title.length < SCHEMA_LIMITS.outingTitle.min) {
      toast.error('Outing title must be at least 4 characters.');
      return false;
    }
    if (dateLabel.length < SCHEMA_LIMITS.outingDateLabel.min) {
      toast.error('Please enter a date and start time.');
      return false;
    }
    if (location.length < SCHEMA_LIMITS.outingLocation.min) {
      toast.error('Please enter a trailhead or meeting location.');
      return false;
    }
    if (description.length < SCHEMA_LIMITS.outingDescription.min) {
      toast.error('Outing details must be at least 10 characters.');
      return false;
    }

    const outingId = slugifyId(title);
    const hostName = sanitizeString(
      currentProfile?.displayName || activeUser.displayName || 'Trip Leader',
      SCHEMA_LIMITS.displayName.max
    );
    const path = `outings/${outingId}`;

    try {
      await setDoc(doc(db, 'outings', outingId), {
        hostId: activeUser.uid,
        hostName: hostName.length >= 2 ? hostName : 'Trip Leader',
        orgId: sanitizeString(input.orgId, SCHEMA_LIMITS.maxIdLength),
        orgName: sanitizeString(input.orgName || 'Fieldline Commons', SCHEMA_LIMITS.orgName.max),
        title,
        discipline: input.discipline,
        dateLabel,
        location,
        region: input.region,
        difficulty: input.difficulty,
        maxSpots,
        description,
        visibility: 'public',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success('Outing posted to the calendar.');
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const deleteOuting = async (outingId: string) => {
    const activeUser = await requireSignedIn();
    if (!activeUser) return;
    const path = `outings/${outingId}`;
    try {
      await deleteDoc(doc(db, 'outings', outingId));
      toast.success('Outing removed.');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const toggleOutingRsvp = async (outing: OutingItem) => {
    const activeUser = await requireSignedIn();
    if (!activeUser) return;

    const rsvpId = `${activeUser.uid}_${outing.id}`;
    const existingRsvp = rsvps.find((r) => r.id === rsvpId);
    const path = `rsvps/${rsvpId}`;

    try {
      if (existingRsvp) {
        await deleteDoc(doc(db, 'rsvps', rsvpId));
        toast.success(`Canceled RSVP for ${outing.title}.`);
      } else {
        const userName = sanitizeString(
          currentProfile?.displayName || activeUser.displayName || 'Trail Member',
          SCHEMA_LIMITS.displayName.max
        );
        await setDoc(doc(db, 'rsvps', rsvpId), {
          userId: activeUser.uid,
          userName: userName.length >= 2 ? userName : 'Trail Member',
          outingId: sanitizeString(outing.id, SCHEMA_LIMITS.maxIdLength),
          status: 'going',
          visibility: 'public',
          createdAt: serverTimestamp(),
        });
        toast.success(`RSVP confirmed for ${outing.title}.`);
      }
    } catch (error) {
      handleFirestoreError(
        error,
        existingRsvp ? OperationType.DELETE : OperationType.CREATE,
        path
      );
    }
  };

  const createCarpoolOffer = async (input: CreateCarpoolOfferInput): Promise<boolean> => {
    const activeUser = await requireSignedIn();
    if (!activeUser) return false;

    const departurePoint = sanitizeString(input.departurePoint, SCHEMA_LIMITS.departurePoint.max);
    const itemSummary = sanitizeString(input.itemSummary, SCHEMA_LIMITS.itemSummary.max);
    const notes = sanitizeString(input.notes, SCHEMA_LIMITS.offerNotes.max);
    const totalSlots = Math.max(
      SCHEMA_LIMITS.offerSlots.min,
      Math.min(SCHEMA_LIMITS.offerSlots.max, Math.round(Number(input.totalSlots) || 1))
    );

    if (departurePoint.length < SCHEMA_LIMITS.departurePoint.min) {
      toast.error('Please enter a pickup neighborhood or handoff location.');
      return false;
    }
    if (itemSummary.length < SCHEMA_LIMITS.itemSummary.min) {
      toast.error('Please describe the carpool ride or loaner gear.');
      return false;
    }

    const offerId = slugifyId(input.offerType === 'carpool' ? 'ride' : 'gear');
    const hostName = sanitizeString(
      currentProfile?.displayName || activeUser.displayName || 'Trail Member',
      SCHEMA_LIMITS.displayName.max
    );
    const path = `carpoolOffers/${offerId}`;

    try {
      await setDoc(doc(db, 'carpoolOffers', offerId), {
        outingId: sanitizeString(input.outingId, SCHEMA_LIMITS.maxIdLength),
        hostId: activeUser.uid,
        hostName: hostName.length >= 2 ? hostName : 'Trail Member',
        offerType: input.offerType,
        departurePoint,
        itemSummary,
        totalSlots,
        notes,
        visibility: 'public',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success(
        input.offerType === 'carpool' ? 'Carpool offer posted.' : 'Loaner gear offer posted.'
      );
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const deleteCarpoolOffer = async (offerId: string) => {
    const activeUser = await requireSignedIn();
    if (!activeUser) return;
    const path = `carpoolOffers/${offerId}`;
    try {
      await deleteDoc(doc(db, 'carpoolOffers', offerId));
      toast.success('Offer removed.');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const toggleCarpoolClaim = async (offer: CarpoolOfferItem) => {
    const activeUser = await requireSignedIn();
    if (!activeUser) return;

    const claimId = `${activeUser.uid}_${offer.id}`;
    const existingClaim = carpoolClaims.find((c) => c.id === claimId);
    const path = `carpoolClaims/${claimId}`;

    try {
      if (existingClaim) {
        await deleteDoc(doc(db, 'carpoolClaims', claimId));
        toast.success('Released your spot.');
      } else {
        const currentClaims = carpoolClaims.filter((c) => c.offerId === offer.id);
        if (currentClaims.length >= offer.totalSlots) {
          toast.info('All spots for this offer are already claimed.');
          return;
        }
        const userName = sanitizeString(
          currentProfile?.displayName || activeUser.displayName || 'Trail Member',
          SCHEMA_LIMITS.displayName.max
        );
        await setDoc(doc(db, 'carpoolClaims', claimId), {
          offerId: sanitizeString(offer.id, SCHEMA_LIMITS.maxIdLength),
          outingId: sanitizeString(offer.outingId, SCHEMA_LIMITS.maxIdLength),
          userId: activeUser.uid,
          userName: userName.length >= 2 ? userName : 'Trail Member',
          visibility: 'public',
          createdAt: serverTimestamp(),
        });
        toast.success(
          offer.offerType === 'carpool' ? 'Carpool seat claimed.' : 'Loaner gear reserved.'
        );
      }
    } catch (error) {
      handleFirestoreError(
        error,
        existingClaim ? OperationType.DELETE : OperationType.CREATE,
        path
      );
    }
  };

  const submitClubClaim = async (input: SubmitClubClaimInput): Promise<boolean> => {
    const activeUser = await requireSignedIn();
    if (!activeUser) return false;

    const roleTitle = sanitizeString(input.roleTitle, SCHEMA_LIMITS.claimRoleTitle.max);
    const proposedSummary = sanitizeString(input.proposedSummary, SCHEMA_LIMITS.summary.max);
    const proposedWebsite = sanitizeUrl(input.proposedWebsite);
    const proposedChapterCount = sanitizeString(
      input.proposedChapterCount,
      SCHEMA_LIMITS.chapterCount.max
    );
    const notes = sanitizeString(input.notes, SCHEMA_LIMITS.claimNotes.max);

    if (roleTitle.length < SCHEMA_LIMITS.claimRoleTitle.min) {
      toast.error('Please enter your role with the organization (e.g., Chapter Leader).');
      return false;
    }
    if (notes.length < SCHEMA_LIMITS.claimNotes.min) {
      toast.error('Please provide at least 10 characters explaining your update or verification.');
      return false;
    }

    const claimId = slugifyId('claim');
    const requesterName = sanitizeString(
      currentProfile?.displayName || activeUser.displayName || 'Chapter Organizer',
      SCHEMA_LIMITS.displayName.max
    );
    const path = `clubClaims/${claimId}`;

    try {
      await setDoc(doc(db, 'clubClaims', claimId), {
        orgId: sanitizeString(input.orgId, SCHEMA_LIMITS.maxIdLength),
        orgName: sanitizeString(input.orgName, SCHEMA_LIMITS.orgName.max),
        requesterId: activeUser.uid,
        requesterName: requesterName.length >= 2 ? requesterName : 'Chapter Organizer',
        roleTitle,
        proposedSummary,
        proposedWebsite,
        proposedChapterCount,
        notes,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success('Chapter update request submitted for stewardship review.');
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const reviewClubClaim = async (claimId: string, status: 'approved' | 'rejected') => {
    const activeUser = await requireSignedIn();
    if (!activeUser || !isAdmin) return;
    const path = `clubClaims/${claimId}`;
    try {
      await updateDoc(doc(db, 'clubClaims', claimId), {
        status,
        updatedAt: serverTimestamp(),
      });
      toast.success(status === 'approved' ? 'Claim approved.' : 'Claim marked rejected.');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  return (
    <CommunityContext.Provider
      value={{
        user,
        isAdmin,
        authReady,
        signingIn,
        currentProfile,
        profiles,
        organizations,
        memberships,
        bookmarks,
        posts,
        postLikes,
        postComments,
        outings,
        rsvps,
        follows,
        carpoolOffers,
        carpoolClaims,
        clubClaims,
        signInWithGoogle,
        signOutUser,
        updateProfile,
        toggleClubMembership,
        toggleClubBookmark,
        toggleFollowMember,
        submitOrganization,
        updateOrganization,
        deleteOrganization,
        createPost,
        deletePost,
        togglePostLike,
        addComment,
        deleteComment,
        createOuting,
        deleteOuting,
        toggleOutingRsvp,
        createCarpoolOffer,
        deleteCarpoolOffer,
        toggleCarpoolClaim,
        submitClubClaim,
        reviewClubClaim,
      }}
    >
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunity() {
  const ctx = useContext(CommunityContext);
  if (!ctx) {
    throw new Error('useCommunity must be used within CommunityProvider');
  }
  return ctx;
}
