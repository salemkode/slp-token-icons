const { Octokit } = require('@octokit/rest');

class GitHubService {
  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });
    this.owner = process.env.GITHUB_OWNER;
    this.repo = process.env.GITHUB_REPO;
  }

  async commitToGitHub(txid, processedImages, authorName = 'Anonymous', authorEmail = 'anonymous@example.com') {
    try {
      console.log(`Committing icons for txid: ${txid}`);
      
      // Get the current state of the repository
      const { data: ref } = await this.octokit.rest.git.getRef({
        owner: this.owner,
        repo: this.repo,
        ref: 'heads/main'
      });

      const currentCommitSha = ref.object.sha;

      // Get the current tree
      const { data: currentCommit } = await this.octokit.rest.git.getCommit({
        owner: this.owner,
        repo: this.repo,
        commit_sha: currentCommitSha
      });

      const currentTreeSha = currentCommit.tree.sha;

      // Prepare file changes
      const treeItems = [];
      const filePaths = [];

      // Process each image size
      for (const [key, imageData] of Object.entries(processedImages)) {
        let path;
        
        if (key === 'original') {
          path = `original/${txid}.png`;
        } else if (key === 'svg' && imageData.format === 'svg') {
          path = `svg/${txid}.svg`;
        } else if (key.startsWith('size_')) {
          const size = key.replace('size_', '');
          path = `${size}/${txid}.png`;
        } else {
          continue; // Skip unknown keys
        }

        filePaths.push(path);

        // Create blob for this file
        const { data: blob } = await this.octokit.rest.git.createBlob({
          owner: this.owner,
          repo: this.repo,
          content: imageData.buffer.toString('base64'),
          encoding: 'base64'
        });

        treeItems.push({
          path: path,
          mode: '100644',
          type: 'blob',
          sha: blob.sha
        });
      }

      if (treeItems.length === 0) {
        throw new Error('No valid images to commit');
      }

      // Create new tree
      const { data: newTree } = await this.octokit.rest.git.createTree({
        owner: this.owner,
        repo: this.repo,
        base_tree: currentTreeSha,
        tree: treeItems
      });

      // Create commit
      const commitMessage = `Add icon for token ${txid}\n\nFiles added:\n${filePaths.map(p => `- ${p}`).join('\n')}\n\nUploaded via serverless icon uploader`;
      
      const { data: newCommit } = await this.octokit.rest.git.createCommit({
        owner: this.owner,
        repo: this.repo,
        message: commitMessage,
        tree: newTree.sha,
        parents: [currentCommitSha],
        author: {
          name: authorName,
          email: authorEmail,
          date: new Date().toISOString()
        },
        committer: {
          name: 'SLP Icon Uploader',
          email: 'icon-uploader@slp-icons.com',
          date: new Date().toISOString()
        }
      });

      // Update the reference
      await this.octokit.rest.git.updateRef({
        owner: this.owner,
        repo: this.repo,
        ref: 'heads/main',
        sha: newCommit.sha
      });

      const commitUrl = `https://github.com/${this.owner}/${this.repo}/commit/${newCommit.sha}`;
      
      console.log(`Successfully committed icons for ${txid}: ${commitUrl}`);
      
      return {
        commitSha: newCommit.sha,
        commitUrl: commitUrl,
        filePaths: filePaths,
        message: commitMessage
      };

    } catch (error) {
      console.error('GitHub commit error:', error);
      
      if (error.status === 401) {
        throw new Error('GitHub authentication failed. Please check your token.');
      } else if (error.status === 403) {
        throw new Error('GitHub access denied. Please check repository permissions.');
      } else if (error.status === 404) {
        throw new Error('GitHub repository not found. Please check repository configuration.');
      } else {
        throw new Error(`GitHub commit failed: ${error.message}`);
      }
    }
  }

  async checkIfIconExists(txid) {
    try {
      // Check if any icon files exist for this txid
      const paths = [
        `original/${txid}.png`,
        `128/${txid}.png`,
        `64/${txid}.png`,
        `32/${txid}.png`,
        `svg/${txid}.svg`
      ];

      for (const path of paths) {
        try {
          await this.octokit.rest.repos.getContent({
            owner: this.owner,
            repo: this.repo,
            path: path
          });
          return true; // File exists
        } catch (error) {
          if (error.status !== 404) {
            throw error; // Re-throw non-404 errors
          }
          // Continue checking other paths
        }
      }

      return false; // No files found

    } catch (error) {
      console.error('Error checking if icon exists:', error);
      throw new Error(`Failed to check if icon exists: ${error.message}`);
    }
  }

  async validateRepository() {
    try {
      // Check if we can access the repository
      const { data: repo } = await this.octokit.rest.repos.get({
        owner: this.owner,
        repo: this.repo
      });

      // Check if we have write access
      const { data: permissions } = await this.octokit.rest.repos.get({
        owner: this.owner,
        repo: this.repo
      });

      if (!permissions.permissions?.push) {
        throw new Error('No write access to repository');
      }

      return {
        valid: true,
        repositoryUrl: repo.html_url,
        hasWriteAccess: true
      };

    } catch (error) {
      console.error('Repository validation error:', error);
      throw new Error(`Repository validation failed: ${error.message}`);
    }
  }
}

// Create singleton instance
const githubService = new GitHubService();

module.exports = {
  commitToGitHub: (txid, processedImages, authorName, authorEmail) => 
    githubService.commitToGitHub(txid, processedImages, authorName, authorEmail),
  checkIfIconExists: (txid) => githubService.checkIfIconExists(txid),
  validateRepository: () => githubService.validateRepository()
};